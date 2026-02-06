import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import {
  ParseGetQuery,
  ParsePutBody,
  ParsePostBody,
  ParseDeleteQuery
} from '@/utils/parseQuery'
import { resourceCommentCreateSchema, resourceCommentUpdateSchema } from '@/validations/comment'

import { createResourceComment } from './create'
import { deleteResourceComment } from './delete'
import { getResourceComment } from './get'
import { updateComment } from './update'

const detailIdSchema = z.object({
  dbId: z.coerce.string().min(7).max(7)
})

const commentIdSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999),
  resourceId: z.coerce.number().min(1).max(9999999)
})

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, detailIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  
  const payload = await verifyHeaderCookie(req)

  const response = await getResourceComment(input.dbId, payload?.uid ?? -1)

  return NextResponse.json(response)
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, resourceCommentCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await createResourceComment(input, payload.uid)

  return NextResponse.json(response)
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, resourceCommentUpdateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await updateComment(input, payload.uid, payload.role)

  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = ParseDeleteQuery(req, commentIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await deleteResourceComment(input, payload.uid, payload.role)

  return NextResponse.json(response)
}
