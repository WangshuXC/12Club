import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'

import { prisma } from '../../../../../prisma'

import type { UserState } from '@/store/userStore'

export const getStatus = async (uid: number | undefined) => {
  try {
    if (!uid) {
      return '用户ID无效'
    }

    const user = await prisma.user.findUnique({
      where: { id: uid }
    })

    if (!user) {
      return '用户未找到'
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login_time: new Date().toISOString()
      }
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
    console.error('获取用户状态失败:', error)
    return error instanceof Error ? error.message : '获取用户状态时发生未知错误'
  }
}

export async function GET(req: NextRequest) {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登陆失效')
  }

  const status = await getStatus(payload?.uid)

  return NextResponse.json(status)
}
