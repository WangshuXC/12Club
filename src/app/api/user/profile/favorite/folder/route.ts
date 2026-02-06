import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import {
  ParseDeleteQuery,
  ParseGetQuery,
  ParsePostBody,
  ParsePutBody
} from '@/utils/parseQuery'
import {
  createFavoriteFolderSchema,
  updateFavoriteFolderSchema
} from '@/validations/user'

import { createFolder } from './create'
import { deleteFolder } from './delete'
import { getFolders } from './get'
import { updateFolder } from './update'

const folderIdSchema = z.object({
  folderId: z.coerce.number().min(1).max(9999999)
})

const dbIdSchema = z.object({
  dbId: z.coerce.string().min(1).max(10).optional()
})

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, dbIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await getFolders(input, payload.uid, payload.uid)

  return NextResponse.json(res)
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, createFavoriteFolderSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await createFolder(input, payload.uid)

  return NextResponse.json(res)
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, updateFavoriteFolderSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await updateFolder(input, payload.uid)

  return NextResponse.json(response)
}

export const DELETE = async (req: NextRequest) => {
  const input = ParseDeleteQuery(req, folderIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await deleteFolder(input, payload.uid)

  return NextResponse.json(res)
}
