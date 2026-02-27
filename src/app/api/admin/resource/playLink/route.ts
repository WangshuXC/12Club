import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import {
  ParseGetQuery,
  ParsePostBody,
  ParsePutBody,
  ParseDeleteQuery
} from '@/utils/parseQuery'
import {
  adminGetResourcePlayLinksSchema,
  adminCreateResourcePlayLinkSchema,
  adminUpdateResourcePlayLinkSchema,
  adminDeleteResourcePlayLinkQuerySchema
} from '@/validations/admin'

import { createResourcePlayLink } from './create'
import { deleteResourcePlayLink } from './delete'
import { getResourcePlayLinks } from './get'
import { updateResourcePlayLink } from './update'

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, adminGetResourcePlayLinksSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ success: false, message: input })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ success: false, message: '用户未登录' })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      success: false,
      message: '本页面仅管理员可访问'
    })
  }

  const res = await getResourcePlayLinks(input)

  return NextResponse.json(res)
}

export async function POST(req: NextRequest) {
  const input = await ParsePostBody(req, adminCreateResourcePlayLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ success: false, message: input })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ success: false, message: '用户未登录' })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      success: false,
      message: '本页面仅管理员可访问'
    })
  }

  const res = await createResourcePlayLink(input, payload.uid)

  return NextResponse.json(res)
}

export async function PUT(req: NextRequest) {
  const input = await ParsePutBody(req, adminUpdateResourcePlayLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ success: false, message: input })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ success: false, message: '用户未登录' })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      success: false,
      message: '本页面仅管理员可访问'
    })
  }

  const res = await updateResourcePlayLink(input)

  return NextResponse.json(res)
}

export async function DELETE(req: NextRequest) {
  const input = ParseDeleteQuery(req, adminDeleteResourcePlayLinkQuerySchema)
  if (typeof input === 'string') {
    return NextResponse.json({ success: false, message: input })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ success: false, message: '用户未登录' })
  }

  if (payload.role < 3) {
    return NextResponse.json({
      success: false,
      message: '本页面仅管理员可访问'
    })
  }

  const res = await deleteResourcePlayLink(input)

  return NextResponse.json(res)
}
