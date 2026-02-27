import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import {
  ParseGetQuery,
  ParsePostBody,
  ParsePutBody,
  ParseDeleteQuery
} from '@/utils/parseQuery'
import {
  adminPaginationSchema,
  adminCreateAnnouncementSchema,
  adminUpdateAnnouncementSchema,
  adminDeleteAnnouncementSchema
} from '@/validations/admin'

import { createAnnouncement } from './create'
import { deleteAnnouncement } from './delete'
import { getAnnouncementInfo } from './get'
import { updateAnnouncement } from './update'

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, adminPaginationSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 })
  }

  const response = await getAnnouncementInfo(input)
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 200 })
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, adminCreateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 })
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ message: '用户未登录', status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      message: '权限不足，仅管理员可操作',
      status: 403
    })
  }

  const response = await createAnnouncement(input, payload.uid)
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 201 })
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, adminUpdateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 })
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ message: '用户未登录', status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      message: '权限不足，仅管理员可操作',
      status: 403
    })
  }

  const response = await updateAnnouncement(input)
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 200 })
}

export const DELETE = async (req: NextRequest) => {
  const input = await ParseDeleteQuery(req, adminDeleteAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 })
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ message: '用户未登录', status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      message: '权限不足，仅管理员可操作',
      status: 403
    })
  }

  const response = await deleteAnnouncement(input)
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 200 })
}
