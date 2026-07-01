import { NextRequest, NextResponse } from 'next/server'

import { withAdminAuth } from '@/lib/withAdminAuth'
import { ParsePutBody } from '@/utils/parseQuery'
import { adminUpdateAnnouncementSchema } from '@/validations/admin'

import { deleteAnnouncement } from '../delete'
import { updateAnnouncement } from '../update'

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const announcementId = parseInt(id)
  if (isNaN(announcementId)) {
    return NextResponse.json(
      { message: '无效的公告ID', status: 400 },
      { status: 400 }
    )
  }

  const input = await ParsePutBody(req, adminUpdateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return withAdminAuth(req, async (_payload) => {
    // 确保ID匹配
    const updateInput = { ...input, id: announcementId }

    const response = await updateAnnouncement(updateInput)
    if (typeof response === 'string') {
      return NextResponse.json(
        { message: response, status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...response, status: 200 })
  })
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params
  const announcementId = parseInt(id)
  if (isNaN(announcementId)) {
    return NextResponse.json(
      { message: '无效的公告ID', status: 400 },
      { status: 400 }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return withAdminAuth(req, async (_payload) => {
    const response = await deleteAnnouncement({ id: announcementId })
    if (typeof response === 'string') {
      return NextResponse.json(
        { message: response, status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...response, status: 200 })
  })
}
