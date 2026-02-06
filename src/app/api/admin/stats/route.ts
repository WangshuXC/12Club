import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'

import { prisma } from '../../../../../prisma'

import type { OverviewData } from '@/types/api/admin'

const daysSchema = z.object({
  days: z.coerce
    .number({ message: '天数必须为数字' })
    .min(1)
    .max(60, { message: '最多展示 60 天的数据' })
})

export const getOverviewData = async (days: number): Promise<OverviewData> => {
  const time = new Date()
  time.setDate(time.getDate() - days)

  const [newUser, newActiveUser, newResource, newResourcePatch, newComment] =
    await Promise.all([
      prisma.user.count({
        where: {
          created: {
            gte: time
          }
        }
      }),
      prisma.user.count({
        where: {
          last_login_time: {
            gte: time.getTime().toString()
          }
        }
      }),
      prisma.resource.count({
        where: {
          created: {
            gte: time
          }
        }
      }),
      prisma.resourcePatch.count({
        where: {
          created: {
            gte: time
          }
        }
      }),
      prisma.resourceComment.count({
        where: {
          created: {
            gte: time
          }
        }
      })
    ])

  return { newUser, newActiveUser, newResource, newResourcePatch, newComment }
}

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, daysSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const data = await getOverviewData(input.days)

  return NextResponse.json(data)
} 