import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery } from '@/utils/parseQuery'
import { adminGetSeriesDetailSchema } from '@/validations/admin'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { getSeriesDetail } from './get'

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, adminGetSeriesDetailSchema)
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

  const res = await getSeriesDetail(input)
  return NextResponse.json(res)
}
