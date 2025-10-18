import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery, ParsePutBody, ParseDeleteQuery } from '@/utils/parseQuery'
import {
  adminUpdateResourceSchema, 
  adminDeleteResourceSchema,
  adminGetResourceSchema
} from '@/validations/admin'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { getResource } from './get'
import { updateResource } from './update'
import { deleteResource } from './delete'

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, adminGetResourceSchema)
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

  const res = await getResource(input)
  return NextResponse.json(res)
}

export async function PUT(req: NextRequest) {
  const input = await ParsePutBody(req, adminUpdateResourceSchema)
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

  const res = await updateResource(input)
  return NextResponse.json(res)
}

export async function DELETE(req: NextRequest) {
  const input = ParseDeleteQuery(req, adminDeleteResourceSchema)
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

  const res = await deleteResource(input)
  return NextResponse.json(res)
}
