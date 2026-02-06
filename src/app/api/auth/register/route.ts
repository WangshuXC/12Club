import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRemoteIp } from '@/utils/getRemoteIp'
import { generateToken } from '@/utils/jwt'
import { ParsePostBody } from '@/utils/parseQuery'
import { backendRegisterSchema } from '@/validations/auth'

import { prisma } from '../../../../../prisma'

import type { UserState } from '@/store/userStore'

export const register = async (
  input: z.infer<typeof backendRegisterSchema>,
  ip: string
) => {
  const { name, email, password } = input

  try {
    // 1. 检查用户名是否已存在
    const usernameCount = await prisma.user.count({
      where: { name: name }
    })

    if (usernameCount > 0) {
      return '您的用户名已经有人注册了, 请修改'
    }

    // 2. 检查邮箱是否已存在
    const emailCount = await prisma.user.count({
      where: { email: email }
    })

    if (emailCount > 0) {
      return '您的邮箱已经有人注册了, 请修改'
    }

    // 3. 创建用户
    const user = await prisma.user.create({
      data: {
        name: name,
        email,
        password,
        ip,
        role: 1,
        status: 0,
        enable_email_notice: true
      }
    })

    const token = await generateToken(user.id, name, user.role, '30d')
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
    console.error('注册失败:', error)
    return error instanceof Error ? error.message : '注册时发生未知错误'
  }
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, backendRegisterSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  if (
    !req.headers ||
    (!req.headers.get('x-forwarded-for') &&
      !req.headers.get('x-real-ip') &&
      !req.headers.get('CF-Connecting-IP'))
  ) {
    return NextResponse.json('读取请求头失败')
  }

  const ip = getRemoteIp(req.headers)

  const response = await register(input, ip)

  return NextResponse.json(response)
}
