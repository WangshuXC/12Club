import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseFormData } from '@/utils/parseQuery'
import { avatarSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'
import { uploadUserAvatar } from '../_upload'

export const updateUserAvatar = async (uid: number, avatar: ArrayBuffer) => {
  const user = await prisma.user.findUnique({
    where: { id: uid }
  })
  if (!user) {
    return '用户未找到'
  }

  const res = await uploadUserAvatar(avatar, uid)
  if (typeof res === 'string') {
    return res
  }

  const imageLink = `${process.env.IMAGE_BED_URL}/user/avatar/user_${uid}/avatar.avif`

  await prisma.user.update({
    where: { id: uid },
    data: { avatar: imageLink }
  })

  return { avatar: imageLink }
}

export const POST = async (req: NextRequest) => {
  const input = await ParseFormData(req, avatarSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const avatar = await new Response(input.avatar)?.arrayBuffer()

  const res = await updateUserAvatar(payload.uid, avatar)

  return NextResponse.json(res)
}
