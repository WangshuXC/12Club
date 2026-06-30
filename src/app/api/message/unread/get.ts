import { prisma } from '@/lib/prisma'
import { CATEGORY_TYPE_MAP } from '@/validations/message'

import type { UnreadCountData } from '@/types/api/message'

export const getUnreadCount = async (
  uid: number
): Promise<UnreadCountData | string> => {
  try {
    const [notice, update, comment] = await Promise.all([
      prisma.userMessage.count({
        where: {
          recipient_id: uid,
          status: 0,
          type: { in: CATEGORY_TYPE_MAP.notice }
        }
      }),
      prisma.userMessage.count({
        where: {
          recipient_id: uid,
          status: 0,
          type: { in: CATEGORY_TYPE_MAP.update }
        }
      }),
      prisma.userMessage.count({
        where: {
          recipient_id: uid,
          status: 0,
          type: { in: CATEGORY_TYPE_MAP.comment }
        }
      })
    ])

    return {
      notice,
      update,
      comment,
      total: notice + update + comment
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error)
    return error instanceof Error
      ? error.message
      : '获取未读消息数时发生未知错误'
  }
}
