import { prisma } from '@/lib/prisma'

import type { AdminNotificationData } from '@/types/api/admin'

const EMPTY_NOTIFICATION: AdminNotificationData = {
  passwordResets: 0,
  feedbacks: 0,
  reports: 0,
  total: 0
}

/** 取 allSettled 结果中的数值，失败时回退为 0 */
const settledValue = (result: PromiseSettledResult<number>): number =>
  result.status === 'fulfilled' ? result.value : 0

export const getAdminNotification =
  async (): Promise<AdminNotificationData> => {
    try {
      // 合并 feedback / report 两次 count 为一次 groupBy，减少一次 DB 往返
      const [resetsResult, messagesResult] = await Promise.allSettled([
        prisma.passwordReset.count({ where: { status: 0 } }),
        prisma.userMessage.groupBy({
          by: ['type'],
          where: {
            type: { in: ['feedback', 'report'] },
            sender_id: { not: null },
            status: 0
          },
          _count: { _all: true }
        })
      ])

      const passwordResets = settledValue(resetsResult)

      let feedbacks = 0
      let reports = 0
      if (messagesResult.status === 'fulfilled') {
        for (const row of messagesResult.value) {
          if (row.type === 'feedback') feedbacks = row._count._all
          else if (row.type === 'report') reports = row._count._all
        }
      }

      return {
        passwordResets,
        feedbacks,
        reports,
        total: passwordResets + feedbacks + reports
      }
    } catch (error) {
      // 任何未预期错误均降级为空通知，避免 layout 级 500
      console.error('获取管理员通知失败:', error)

      return EMPTY_NOTIFICATION
    }
  }
