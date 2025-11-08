import { NextRequest, NextResponse } from 'next/server'
import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { prisma } from '../../../../../../prisma'
import type { AdminNotificationData } from '@/types/api/admin'

export const getAdminNotification = async (): Promise<AdminNotificationData> => {
  const [pendingResets, pendingFeedbacks, pendingReports] = await Promise.all([
    // 未处理的密码重置请求
    prisma.passwordReset.count({
      where: { status: 0 }
    }),

    // 未处理的资源反馈
    prisma.userMessage.count({
      where: { type: 'feedback', sender_id: { not: null }, status: 0 }
    }),

    // 未处理的举报
    prisma.userMessage.count({
      where: { type: 'report', sender_id: { not: null }, status: 0 }
    })
  ])

  return {
    passwordResets: pendingResets,
    feedbacks: pendingFeedbacks,
    reports: pendingReports,
    total: pendingResets + pendingFeedbacks + pendingReports
  }
}

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }
  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const data = await getAdminNotification()
  return NextResponse.json(data)
}