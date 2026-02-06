import { z } from 'zod'

import { prisma } from '../../../../../prisma'
import { deleteResource } from '../../patch/delete'

const userIdSchema = z.object({
  uid: z.coerce.number({ message: '用户 ID 必须为数字' }).min(1).max(9999999)
})

export const deleteUser = async (
  input: z.infer<typeof userIdSchema>,
  uid: number
) => {
  try {
    // 查找目标用户
    const userData = await prisma.user.findUnique({
      where: { id: input.uid },
      select: { id: true, name: true, bio: true, role: true, status: true }
    })

    if (!userData) {
      return '未找到该用户'
    }

    if (input.uid === uid) {
      return '请勿删除自己'
    }

    // 查找管理员信息
    const adminData = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, bio: true, role: true, status: true }
    })

    if (!adminData) {
      return '未找到该管理员'
    }

    if (adminData.role < 3) {
      return '删除用户仅限管理员可用'
    }

    // 查找用户的所有资源补丁
    const resourceData = await prisma.resourcePatch.findMany({
      where: { user_id: input.uid },
      select: { id: true }
    })

    // 删除用户的所有资源补丁
    if (resourceData && resourceData.length > 0) {
      for (const resource of resourceData) {
        const deleteResourceResult = await deleteResource(
          { patchId: resource.id },
          uid,
          adminData.role
        )
        if (deleteResourceResult && typeof deleteResourceResult === 'string') {
          return deleteResourceResult
        }
      }
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: input.uid }
    })

    return {}
  } catch (error) {
    console.error('删除用户失败:', error)
    return error instanceof Error ? error.message : '删除用户时发生未知错误'
  }
}
