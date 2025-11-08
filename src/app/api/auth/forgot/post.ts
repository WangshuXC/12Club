import { prisma } from '../../../../../prisma'
import { forgotRequestSchema } from '@/validations/auth'
import { randomUUID } from 'crypto'

export const requestPasswordReset = async (input: {
  name: string
  email: string
}) => {
  try {
    const { name, email } = input

    // 查找用户是否存在且用户名和邮箱匹配
    const user = await prisma.user.findFirst({
      where: {
        name: name,
        email: email
      }
    })

    if (!user) {
      return '用户名和邮箱不匹配，请检查输入信息'
    }

    // 检查是否已有重置码
    const existingReset = await prisma.passwordReset.findFirst({
      where: {
        user_id: user.id
      }
    })

    if (existingReset) {
      return '您已有一个重置码，请检查邮箱'
    }

    // 生成重置码
    const resetCode = randomUUID()

    // 创建密码重置记录
    await prisma.passwordReset.create({
      data: {
        user_id: user.id,
        name: user.name,
        email: user.email,
        reset_code: resetCode,
        status: 0
      }
    })

    return {
      message: '重置密码请求已发送，请检查您的邮箱',
      // 开发环境下返回重置码，生产环境应该移除
      ...(process.env.NODE_ENV === 'development' && { resetCode })
    }
  } catch (error) {
    console.error('Request password reset error:', error)
    return error instanceof Error ? error.message : '申请重置密码时发生未知错误'
  }
}
