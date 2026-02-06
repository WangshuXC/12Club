import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParsePostBody } from '@/utils/parseQuery'
import { bioSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, bioSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  await prisma.user.update({
    where: { id: payload.uid },
    data: { bio: input.bio }
  })

  return NextResponse.json({})
}
