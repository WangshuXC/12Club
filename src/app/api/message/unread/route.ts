import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/verifyHeaderCookie'

import { getUnreadCount } from './get'

export const GET = async (req: NextRequest) => {
  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await getUnreadCount(payload.uid)
  return NextResponse.json(res)
}
