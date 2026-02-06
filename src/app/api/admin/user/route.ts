import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import {
  ParseGetQuery,
  ParsePutBody,
  ParseDeleteQuery
} from '@/utils/parseQuery'
import {
  adminPaginationSchema,
  adminUpdateUserSchema
} from '@/validations/admin'

import { deleteUser } from './delete'
import { getUserInfo } from './get'
import { updateUser } from './update'

const userIdSchema = z.object({
  uid: z.coerce.number({ message: '用户 ID 必须为数字' }).min(1).max(9999999)
})

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, adminPaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await getUserInfo(input)

  return NextResponse.json(response)
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, adminUpdateUserSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const response = await updateUser(input, payload.uid)

  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = ParseDeleteQuery(req, userIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 4) {
    return NextResponse.json('本页面仅超级管理员可访问')
  }

  const response = await deleteUser(input, payload.uid)

  return NextResponse.json(response)
}
