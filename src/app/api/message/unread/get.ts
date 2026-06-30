import { prisma } from '@/lib/prisma'
import { CATEGORY_TYPE_MAP } from '@/validations/message'

import type { MessageCategory, UnreadCountData } from '@/types/api/message'

// 反向索引：type → category，避免 O(N*M) 嵌套查找
const TYPE_TO_CATEGORY: Record<string, MessageCategory> = Object.entries(
  CATEGORY_TYPE_MAP
).reduce(
  (acc, [category, types]) => {
    for (const t of types) {
      acc[t] = category as MessageCategory
    }

    return acc
  },
  {} as Record<string, MessageCategory>
)

const ALL_TYPES = Object.keys(TYPE_TO_CATEGORY)

export const getUnreadCount = async (
  uid: number
): Promise<UnreadCountData | string> => {
  try {
    // 单次 groupBy 替代 3 次并发 count：
    // 1) 连接池占用 3 → 1，避免高频轮询打爆连接池（Timed out fetching a new connection）
    // 2) DB 往返 3 → 1
    const grouped = await prisma.userMessage.groupBy({
      by: ['type'],
      where: {
        recipient_id: uid,
        status: 0,
        type: { in: ALL_TYPES }
      },
      _count: { _all: true }
    })

    const result: UnreadCountData = {
      notice: 0,
      update: 0,
      comment: 0,
      total: 0
    }

    for (const row of grouped) {
      if (!row.type) {
        continue
      }

      const category = TYPE_TO_CATEGORY[row.type]

      if (!category) {
        continue
      }

      const count = row._count._all

      result[category] += count
      result.total += count
    }

    return result
  } catch (error) {
    console.error('获取未读消息数失败:', error)

    return error instanceof Error
      ? error.message
      : '获取未读消息数时发生未知错误'
  }
}
