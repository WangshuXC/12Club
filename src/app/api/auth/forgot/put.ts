import { prisma } from '../../../../../prisma'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'


export const updateResetCodeStatus = async (input: { id: number }) => {
  try {
    // 验证管理员权限
    const payload = await verifyHeaderCookie()
    if (!payload || payload.role < 3) {
      return { success: false, message: '权限不足' }
    }
    const message = await prisma.passwordReset.findUnique({
      where: {
        id: input.id
      },
      select: {
        id: true,
        status: true
      }
    })
    if (message?.status) {
      return { success: false, message: '该重置码已处理' }
    }
    await prisma.passwordReset.update({
      where: {
        id: input.id
      },
      data: {
        status: 1
      }
    })
    console.log('Update reset code status:', input.id)
    return { success: true }
  } catch (error) {
    console.error('Delete reset code error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : '删除重置码时发生未知错误'
    }
  }
}