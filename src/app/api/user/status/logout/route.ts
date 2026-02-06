import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { deleteToken } from '@/utils/jwt'

export async function POST(req: NextRequest) {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  await deleteToken(payload.uid)
  const cookie = await cookies()
  cookie.delete('12club-token')

  return NextResponse.json({ message: '退出登录成功' })
}
