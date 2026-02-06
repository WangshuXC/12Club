import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { ParsePostBody, ParseGetQuery } from '@/utils/parseQuery'
import {
  adminAutoCreateResourcePlayLinkSchema,
  adminAutoCreateResourcePlayLinkQuerySchema
} from '@/validations/admin'

import { autoCreateResourcePlayLinks } from './create'
import { getResourceFileList } from './get'

export async function POST(req: NextRequest) {
  const input = await ParsePostBody(req, adminAutoCreateResourcePlayLinkSchema)
  if (typeof input === 'string') {
    return NextResponse.json({
      success: false,
      message: input
    })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({
      success: false,
      message: '用户未登录'
    })
  }

  const res = await autoCreateResourcePlayLinks(input, payload.uid)

  return NextResponse.json(res)
}

export async function GET(req: NextRequest) {
  const input = await ParseGetQuery(
    req,
    adminAutoCreateResourcePlayLinkQuerySchema
  )
  if (typeof input === 'string') {
    return NextResponse.json({
      success: false,
      message: input
    })
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({
      success: false,
      message: '用户未登录'
    })
  }

  const res = await getResourceFileList(input.dbId)

  return NextResponse.json(res)
}