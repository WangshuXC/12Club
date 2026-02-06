import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import {
  ParsePutBody,
} from '@/utils/parseQuery'
import {
  adminUpdateAnnouncementSchema,
} from '@/validations/admin'

import { deleteAnnouncement } from '../delete'
import { updateAnnouncement } from '../update'

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const announcementId = parseInt(params.id)
  if (isNaN(announcementId)) {
    return NextResponse.json({ message: '无效的公告ID', status: 400 })
  }

  const input = await ParsePutBody(req, adminUpdateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 })
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ message: '用户未登录', status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json({ message: '权限不足，仅管理员可操作', status: 403 })
  }

  // 确保ID匹配
  const updateInput = { ...input, id: announcementId }
  
  const response = await updateAnnouncement(updateInput)
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 200 })
}

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const announcementId = parseInt(params.id)
  if (isNaN(announcementId)) {
    return NextResponse.json({ message: '无效的公告ID', status: 400 })
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json({ message: '用户未登录', status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json({ message: '权限不足，仅管理员可操作', status: 403 })
  }

  const response = await deleteAnnouncement({ id: announcementId })
  if (typeof response === 'string') {
    return NextResponse.json({ message: response, status: 500 })
  }

  return NextResponse.json({ ...response, status: 200 })
} 