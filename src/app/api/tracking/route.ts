import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { verifyHeaderCookie } from '@/middleware/verifyHeaderCookie'
import { ParsePostBody } from '@/utils/parseQuery'

// 单个事件的 schema
const TrackingEventSchema = z.object({
  event_type: z.enum(['expose', 'click', 'custom']),
  event_name: z.string().max(100),
  element_id: z.string().max(100).optional().default(''),
  element_tag: z.string().max(50).optional().default(''),
  page_url: z.string().max(500),
  page_title: z.string().max(200).optional().default(''),
  referrer: z.string().max(500).optional().default(''),
  extra_data: z.record(z.unknown()).optional().nullable(),
  viewport: z.string().max(50).optional().default(''),
  screen: z.string().max(50).optional().default(''),
  device_type: z
    .enum(['desktop', 'mobile', 'tablet'])
    .optional()
    .default('desktop'),
  session_id: z.string().max(36).optional().default(''),
  timestamp: z.string().optional()
})

// 批量上报的 schema
const BatchTrackingSchema = z.object({
  guid: z.string().max(36),
  events: z.array(TrackingEventSchema)
})

// 获取用户 ID（从请求头的 cookie 中解析并验证 JWT token）
const getUserIdFromToken = async (req: NextRequest): Promise<number | null> => {
  try {
    const payload = await verifyHeaderCookie(req)

    return payload?.uid || null
  } catch {
    return null
  }
}

// 获取客户端 IP（做长度与首个地址截取，防御性处理超长头）
const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')

  const raw = forwarded ? forwarded.split(',')[0] : (realIP ?? '')

  return raw.trim().slice(0, 45)
}

// POST - 批量上报埋点事件
export async function POST(req: NextRequest) {
  try {
    const data = await ParsePostBody(req, BatchTrackingSchema)
    if (typeof data === 'string') {
      return NextResponse.json({ error: data }, { status: 400 })
    }

    const { guid, events } = data
    const userId = await getUserIdFromToken(req)
    const userAgent = req.headers.get('user-agent')?.slice(0, 500) || ''
    const ip = getClientIP(req)

    // upsert：一次往返完成"存在则更新，否则创建"，天然规避并发首访竞态
    const visitor = await prisma.trackingVisitor.upsert({
      where: { guid },
      create: {
        guid,
        user_agent: userAgent,
        ip,
        user_id: userId
      },
      update: {
        last_seen: new Date(),
        // 如果已登录则关联，否则保留旧值（Prisma 侧通过条件表达不便，交由后续逻辑）
        ...(userId ? { user_id: userId } : {}),
        user_agent: userAgent,
        ip
      }
    })

    // 批量创建事件（埋点属"尽力而为"，单批异常不阻塞整个响应）
    if (events.length > 0) {
      try {
        await prisma.trackingEvent.createMany({
          data: events.map((event) => ({
            event_type: event.event_type,
            event_name: event.event_name,
            element_id: event.element_id || '',
            element_tag: event.element_tag || '',
            page_url: event.page_url.slice(0, 500),
            page_title: event.page_title || '',
            referrer: event.referrer || '',
            extra_data:
              (event.extra_data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            viewport: event.viewport || '',
            screen: event.screen || '',
            device_type: event.device_type || 'desktop',
            visitor_id: visitor.id,
            user_id: userId,
            session_id: event.session_id || '',
            timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
          }))
        })
      } catch (eventError) {
        console.error('Tracking events insert failed:', eventError)
      }
    }

    return NextResponse.json({
      success: true,
      visitor_id: visitor.id,
      events_count: events.length
    })
  } catch (error) {
    console.error('Tracking error:', error)
    // 埋点上报失败不应触发客户端 SDK 重试，返回 202 表示已受理但未处理成功
    return NextResponse.json(
      { success: false, error: 'tracking dropped' },
      { status: 202 }
    )
  }
}
