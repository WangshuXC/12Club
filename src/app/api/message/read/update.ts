import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { CATEGORY_TYPE_MAP, readMessageSchema } from '@/validations/message'

export const readMessage = async (
  input: z.infer<typeof readMessageSchema>,
  uid: number
): Promise<{ success: true; count: number } | string> => {
  const types = CATEGORY_TYPE_MAP[input.category]

  try {
    const result = await prisma.userMessage.updateMany({
      where: {
        recipient_id: uid,
        status: 0,
        type: { in: types }
      },
      data: { status: 1 }
    })

    return { success: true, count: result.count }
  } catch (error) {
    console.error('标记已读失败:', error)
    return error instanceof Error ? error.message : '标记已读时发生未知错误'
  }
}
