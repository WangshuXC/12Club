import { NextRequest, NextResponse } from 'next/server'
import { ParsePostBody, ParseDeleteQuery } from '@/utils/parseQuery'
import {
  adminAddSeriesToResourceSchema,
  adminRemoveSeriesFromResourceSchema
} from '@/validations/admin'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { addResourcesToSeries } from './add'
import { removeResourcesFromSeries } from './remove'

export async function POST(req: NextRequest) {
  const input = await ParsePostBody(req, adminAddSeriesToResourceSchema)
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

  const res = await addResourcesToSeries(input)
  return NextResponse.json(res)
}

export async function DELETE(req: NextRequest) {
  const input = ParseDeleteQuery(req, adminRemoveSeriesFromResourceSchema)
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

  const res = await removeResourcesFromSeries(input)
  return NextResponse.json(res)
}