import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { processComments } from '@/utils/processComments'

import { prisma } from '../../../../../../prisma'

const commentIdSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999),
  resourceId: z.coerce
    .number({ message: '资源 ID 必须为数字' })
    .min(1)
    .max(9999999)
})

export const getComment = async (
  input: z.infer<typeof commentIdSchema>,
  uid: number
) => {
  const { commentId, resourceId } = input

  const comment = await prisma.resourceComment.findUnique({
    where: { id: commentId },
    select: {
      content: true
    }
  })

  const comments = await prisma.resourceComment.findMany({
    where: { resource_id: resourceId },
    select: {
      id: true,
      parent_id: true,
      resource_id: true,
      content: true,
      created: true,
      likes: {
        where: {
          user_id: uid
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    },
    orderBy: {
      created: 'desc'
    }
  })

  const processedComments = processComments(comments)

  return { comment: processedComments }
}

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, commentIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await getComment(input, payload.uid)

  return NextResponse.json(response)
}
