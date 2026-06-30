import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/verifyHeaderCookie'
import { ParsePutBody } from '@/utils/parseQuery'
import { readMessageSchema } from '@/validations/message'

import { readMessage } from './update'

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, readMessageSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await readMessage(input, payload.uid)
  return NextResponse.json(res)
}
