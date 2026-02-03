import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../../prisma'
import { ParsePostBody } from '@/utils/parseQuery'
import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'

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
    device_type: z.enum(['desktop', 'mobile', 'tablet']).optional().default('desktop'),
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

// 获取客户端 IP
const getClientIP = (req: NextRequest): string => {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIP = req.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    if (realIP) {
        return realIP
    }
    return ''
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
        const userAgent = req.headers.get('user-agent') || ''
        const ip = getClientIP(req)

        // 查找或创建访客记录
        let visitor = await prisma.trackingVisitor.findUnique({
            where: { guid }
        })

        if (!visitor) {
            visitor = await prisma.trackingVisitor.create({
                data: {
                    guid,
                    user_agent: userAgent.slice(0, 500),
                    ip: ip.slice(0, 45),
                    user_id: userId
                }
            })
        } else {
            // 更新访客信息
            await prisma.trackingVisitor.update({
                where: { id: visitor.id },
                data: {
                    last_seen: new Date(),
                    user_id: userId || visitor.user_id, // 如果已登录，更新用户关联
                    user_agent: userAgent.slice(0, 500),
                    ip: ip.slice(0, 45)
                }
            })
        }

        // 批量创建事件
        if (events.length > 0) {
            await prisma.trackingEvent.createMany({
                data: events.map((event) => ({
                    event_type: event.event_type,
                    event_name: event.event_name,
                    element_id: event.element_id || '',
                    element_tag: event.element_tag || '',
                    page_url: event.page_url.slice(0, 500),
                    page_title: event.page_title || '',
                    referrer: event.referrer || '',
                    extra_data: (event.extra_data as Prisma.InputJsonValue) ?? Prisma.JsonNull,
                    viewport: event.viewport || '',
                    screen: event.screen || '',
                    device_type: event.device_type || 'desktop',
                    visitor_id: visitor.id,
                    user_id: userId,
                    session_id: event.session_id || '',
                    timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
                }))
            })
        }

        return NextResponse.json({
            success: true,
            visitor_id: visitor.id,
            events_count: events.length
        })
    } catch (error) {
        console.error('Tracking error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
