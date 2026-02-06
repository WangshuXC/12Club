import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

import { prisma } from '../../../../../prisma'

export const deleteResetCode = async (id: number) => {
  try {
    // 验证管理员权限
    const payload = await verifyHeaderCookie()
    if (!payload || payload.role < 3) {
      return { success: false, message: '权限不足' }
    }

    // 删除重置码
    await prisma.passwordReset.delete({
      where: { id }
    })

    return { success: true, message: '删除重置码成功' }
  } catch (error) {
    console.error('Delete reset code error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '删除重置码时发生未知错误' 
    }
  }
}
