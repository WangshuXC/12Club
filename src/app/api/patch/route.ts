import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import {
  ParseDeleteQuery,
  ParseGetQuery,
  ParsePostBody,
  ParsePutBody
} from '@/utils/parseQuery'
import {
  patchResourceCreateSchema,
  patchResourceUpdateSchema
} from '@/validations/patch'

import { createPatchResource } from './create'
import { deleteResource } from './delete'
import { getPatchResource } from './get'
import { updatePatchResource } from './update'

const dbIdSchema = z.object({
  dbId: z.coerce.string().min(1).max(9999999)
})

const patchIdSchema = z.object({
  patchId: z.coerce.number().min(1).max(9999999)
})

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, dbIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)

  const response = await getPatchResource(input, payload?.uid ?? 0)

  return NextResponse.json(response)
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, patchResourceCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    if (input.section === 'club') {
      return NextResponse.json('用户或创作者仅可发布个人资源')
    }

    if (input.storage === 'alist') {
      return NextResponse.json('仅管理员可使用 12club 资源盘')
    }
  }

  const response = await createPatchResource(input, payload.uid)

  return NextResponse.json(response)
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, patchResourceUpdateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await updatePatchResource(input, payload.uid, payload.role)

  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = ParseDeleteQuery(req, patchIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await deleteResource(input, payload.uid, payload.role)

  return NextResponse.json(response)
}
