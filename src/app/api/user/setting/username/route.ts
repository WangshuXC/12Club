import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParsePostBody } from '@/utils/parseQuery'
import { usernameSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'

const updateUsername = async (username: string, uid: number) => {
  const user = await prisma.user.findUnique({ where: { id: uid } })
  if (!user) {
    return '用户未找到'
  }

  const normalizedName = username.toLowerCase()
  const sameUsernameUser = await prisma.user.findFirst({
    where: { name: { equals: normalizedName, mode: 'insensitive' } }
  })
  if (sameUsernameUser) {
    return '您的用户名已经有人注册了, 请修改'
  }

  await prisma.user.update({
    where: { id: uid },
    data: { name: username }
  })
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, usernameSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await updateUsername(input.username, payload.uid)
  if (typeof res === 'string') {
    return NextResponse.json(res)
  }

  return NextResponse.json({})
}
