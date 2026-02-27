import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { MESSAGE_TYPE } from '@/constants/message'
import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { Message } from '@/types/api/message'

export const getReport = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit } = input
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.userMessage.findMany({
      where: { type: 'report', sender_id: { not: null } },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { created: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.userMessage.count({
      where: { type: 'report', sender_id: { not: null } }
    })
  ])

  const reports: Message[] = data.map((msg) => ({
    id: msg.id,
    type: msg.type as (typeof MESSAGE_TYPE)[number],
    content: msg.content ?? '',
    status: msg.status,
    link: msg.link,
    created: msg.created,
    sender: msg.sender,
    replies: msg.replies?.map((reply) => ({
      id: reply.id,
      created: reply.created,
      content: reply.content ?? '',
      sender: reply.sender
    }))
  }))

  return { reports, total }
}

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, adminPaginationSchema)
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

  const response = await getReport(input)

  return NextResponse.json(response)
}
