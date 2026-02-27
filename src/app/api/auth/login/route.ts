import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyPassword } from '@/utils/algorithm'
import { generateToken } from '@/utils/jwt'
import { ParsePostBody } from '@/utils/parseQuery'
import { loginSchema } from '@/validations/auth'

import { prisma } from '../../../../../prisma'

import type { UserState } from '@/store/userStore'

export const login = async (input: z.infer<typeof loginSchema>) => {
  const { name, password } = input

  try {
    // 通过用户名或邮箱查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: name }, { name: name }]
      }
    })

    if (!user) {
      return '用户未找到'
    }

    if (user.status === 2) {
      return '该用户已被封禁, 如果您觉得有任何问题, 请联系我们'
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return '用户密码错误'
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login_time: new Date().toISOString()
      }
    })

    const token = await generateToken(user.id, user.name, user.role, '30d')
    const cookie = await cookies()
    cookie.set('12club-token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    })

    const responseData: UserState = {
      uid: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      dailyCheckIn: user.daily_check_in,
      dailyImageLimit: user.daily_image_count,
      dailyUploadLimit: user.daily_upload_size,
      enableEmailNotice: user.enable_email_notice
    }

    return responseData
  } catch (error) {
    console.error('登录失败:', error)
    return error instanceof Error ? error.message : '登录时发生未知错误'
  }
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, loginSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await login(input)

  return NextResponse.json(response)
}
