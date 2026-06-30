import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { getMessageListSchema } from '@/validations/message'

import { getMessageList } from './get'

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, getMessageListSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await getMessageList(input, payload.uid)
  return NextResponse.json(res)
}
