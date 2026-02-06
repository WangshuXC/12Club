import { NextRequest, NextResponse } from 'next/server'

import { hashPassword } from '@/utils/algorithm'
import { forgotResetSchema } from '@/validations/auth'

import { prisma } from '../../../../../prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedData = forgotResetSchema.parse(body)
    const { name, email, resetCode, password } = validatedData

    // 查找用户是否存在且用户名和邮箱匹配
    const user = await prisma.user.findFirst({
      where: {
        name: name,
        email: email
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          message: '用户名和邮箱不匹配，请检查输入信息',
          status: 400
        },
        { status: 400 }
      )
    }

    // 查找重置码
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        user_id: user.id,
        reset_code: resetCode
      }
    })

    if (!passwordReset) {
      return NextResponse.json(
        {
          message: '重置码无效，请重新申请',
          status: 400
        },
        { status: 400 }
      )
    }

    // 验证重置码是否与用户信息匹配
    if (passwordReset.name !== name || passwordReset.email !== email) {
      return NextResponse.json(
        {
          message: '重置码与用户信息不匹配',
          status: 400
        },
        { status: 400 }
      )
    }

    // 哈希新密码
    const hashedPassword = await hashPassword(password)

    // 使用事务更新密码和删除重置码
    await prisma.$transaction(async (tx) => {
      // 更新用户密码
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updated: new Date()
        }
      })

      // 删除该用户的所有重置码
      await tx.passwordReset.deleteMany({
        where: {
          user_id: user.id
        }
      })
    })

    return NextResponse.json(
      {
        message: '密码重置成功',
        status: 200,
        data: {
          uid: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          dailyCheckIn: user.daily_check_in,
          dailyImageLimit: user.daily_image_count,
          dailyUploadLimit: user.daily_upload_size,
          enableEmailNotice: user.enable_email_notice
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          message: '请求数据格式错误',
          status: 400
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: '服务器内部错误',
        status: 500
      },
      { status: 500 }
    )
  }
}
