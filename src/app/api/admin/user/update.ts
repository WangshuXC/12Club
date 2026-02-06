import { z } from 'zod'

import { deleteToken } from '@/utils/jwt'
import { adminUpdateUserSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const updateUser = async (
  input: z.infer<typeof adminUpdateUserSchema>,
  adminUid: number
) => {
  const { uid, ...rest } = input

  try {
    // 查找目标用户
    const userData = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, bio: true, role: true, status: true }
    })

    if (!userData) {
      return '未找到该用户'
    }

    // 查找管理员信息
    const adminData = await prisma.user.findUnique({
      where: { id: adminUid },
      select: { id: true, name: true, bio: true, role: true, status: true }
    })

    if (!adminData) {
      return '未找到该管理员'
    }

    if (rest.role >= 3 && adminData.role < 4) {
      return '设置用户为管理员仅限超级管理员可用'
    }

    // 删除用户token
    await deleteToken(uid)

    // 更新用户信息
    await prisma.user.update({
      where: { id: uid },
      data: {
        ...rest,
        updated: new Date()
      }
    })

    return {}
  } catch (error) {
    console.error('更新用户失败:', error)
    return error instanceof Error ? error.message : '更新用户时发生未知错误'
  }
}
