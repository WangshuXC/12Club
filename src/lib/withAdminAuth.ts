import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/verifyHeaderCookie'

import type { Payload } from '@/utils/jwt'

export const withAdminAuth = async (
  req: NextRequest,
  handler: (payload: Payload) => Promise<NextResponse>
): Promise<NextResponse> => {
  const payload = await verifyHeaderCookie(req)

  if (!payload) {
    return NextResponse.json(
      { message: '用户未登录', status: 401 },
      { status: 401 }
    )
  }

  if (payload.role < 3) {
    return NextResponse.json(
      { message: '权限不足，仅管理员可操作', status: 403 },
      { status: 403 }
    )
  }

  return handler(payload)
}
