import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { hashPassword, verifyPassword } from '@/utils/algorithm'
import { ParsePostBody } from '@/utils/parseQuery'
import { passwordSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'

const updatePassword = async (req: NextRequest) => {
  const input = await ParsePostBody(req, passwordSchema)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return '用户未登录'
  }

  if (!req.headers || !req.headers.get('x-forwarded-for')) {
    return '读取请求头失败'
  }

  const user = await prisma.user.findUnique({ where: { id: payload.uid } })
  const res = await verifyPassword(input.oldPassword, user ? user.password : '')
  if (!res) {
    return '旧密码输入错误'
  }

  const hashedPassword = await hashPassword(input.newPassword)

  await prisma.user.update({
    where: { id: payload.uid },
    data: { password: hashedPassword }
  })
}

export const POST = async (req: NextRequest) => {
  const res = await updatePassword(req)
  if (typeof res === 'string') {
    return NextResponse.json(res)
  }

  return NextResponse.json({})
}
