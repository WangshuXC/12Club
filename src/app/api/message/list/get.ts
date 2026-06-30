import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { CATEGORY_TYPE_MAP, getMessageListSchema } from '@/validations/message'

import type { Message, MessageListResponse } from '@/types/api/message'

export const getMessageList = async (
  input: z.infer<typeof getMessageListSchema>,
  uid: number
): Promise<MessageListResponse | string> => {
  const { page, limit, category } = input
  const types = CATEGORY_TYPE_MAP[category]

  try {
    const [total, messages] = await Promise.all([
      prisma.userMessage.count({
        where: {
          recipient_id: uid,
          type: { in: types }
        }
      }),
      prisma.userMessage.findMany({
        where: {
          recipient_id: uid,
          type: { in: types }
        },
        orderBy: { created: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, avatar: true }
          }
        }
      })
    ])

    return {
      messages: messages.map((m) => ({
        id: m.id,
        type: (m.type ?? '') as Message['type'],
        content: m.content ?? '',
        status: m.status,
        link: m.link,
        created: m.created,
        sender: m.sender
      })),
      total
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    return error instanceof Error ? error.message : '获取消息列表时发生未知错误'
  }
}
