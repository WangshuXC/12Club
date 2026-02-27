import { z } from 'zod'

import { prisma } from '../../../../prisma'

const patchIdSchema = z.object({
  patchId: z.coerce
    .number({ message: '资源 ID 必须为数字' })
    .min(1)
    .max(9999999)
})

export const deleteResource = async (
  input: z.infer<typeof patchIdSchema>,
  uid: number,
  userRole: number
) => {
  try {
    const currentPatch = await prisma.resourcePatch.findUnique({
      where: { id: input.patchId },
      select: { id: true, user_id: true }
    })

    if (!currentPatch) {
      return '未找到该资源'
    }

    const resourceUserUid = currentPatch.user_id
    if (currentPatch.user_id !== uid && userRole < 3) {
      return '您没有权限删除该资源'
    }

    // 删除patch
    await prisma.resourcePatch.delete({
      where: {
        id: currentPatch.id,
        user_id: resourceUserUid
      }
    })

    return {}
  } catch (error) {
    console.error('删除patch失败:', error)
    return error instanceof Error ? error.message : '删除patch时发生未知错误'
  }
}
