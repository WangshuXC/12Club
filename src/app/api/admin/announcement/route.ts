import { NextRequest, NextResponse } from 'next/server'

import { withAdminAuth } from '@/lib/withAdminAuth'
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
    return NextResponse.json({ message: input, status: 400 }, { status: 400 })
  }

  const response = await getAnnouncementInfo(input)
  if (typeof response === 'string') {
    return NextResponse.json(
      { message: response, status: 500 },
      { status: 500 }
    )
  }

  return NextResponse.json({ ...response, status: 200 })
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, adminCreateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 }, { status: 400 })
  }

  return withAdminAuth(req, async (payload) => {
    const response = await createAnnouncement(input, payload.uid)
    if (typeof response === 'string') {
      return NextResponse.json(
        { message: response, status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...response, status: 201 })
  })
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, adminUpdateAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return withAdminAuth(req, async (_payload) => {
    const response = await updateAnnouncement(input)
    if (typeof response === 'string') {
      return NextResponse.json(
        { message: response, status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...response, status: 200 })
  })
}

export const DELETE = async (req: NextRequest) => {
  const input = await ParseDeleteQuery(req, adminDeleteAnnouncementSchema)
  if (typeof input === 'string') {
    return NextResponse.json({ message: input, status: 400 }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return withAdminAuth(req, async (_payload) => {
    const response = await deleteAnnouncement(input)
    if (typeof response === 'string') {
      return NextResponse.json(
        { message: response, status: 500 },
        { status: 500 }
      )
    }

    return NextResponse.json({ ...response, status: 200 })
  })
}
