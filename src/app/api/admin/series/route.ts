import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { ParseGetQuery, ParsePostBody } from '@/utils/parseQuery'
import {
  adminGetSeriesSchema,
  adminCreateSeriesSchema
} from '@/validations/admin'

import { createSeries } from './create'
import { getSeries } from './get'

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, adminGetSeriesSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const res = await getSeries(input)

  return NextResponse.json(res)
}

export async function POST(req: NextRequest) {
  const input = await ParsePostBody(req, adminCreateSeriesSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const res = await createSeries(input, payload.uid)

  return NextResponse.json(res)
}