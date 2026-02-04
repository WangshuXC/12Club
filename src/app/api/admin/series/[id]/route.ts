import { NextRequest, NextResponse } from 'next/server'
import { ParsePutBody, ParseDeleteQuery } from '@/utils/parseQuery'
import {
  adminUpdateSeriesSchema,
  adminDeleteSeriesSchema
} from '@/validations/admin'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { updateSeries } from './update'
import { deleteSeries } from './delete'

export async function PUT(req: NextRequest) {
  const input = await ParsePutBody(req, adminUpdateSeriesSchema)
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

  const res = await updateSeries(input)
  return NextResponse.json(res)
}

export async function DELETE(req: NextRequest) {
  const input = ParseDeleteQuery(req, adminDeleteSeriesSchema)
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

  const res = await deleteSeries(input)
  return NextResponse.json(res)
}