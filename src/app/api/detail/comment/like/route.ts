import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { createDedupMessage } from '@/utils/message'
import { ParsePutBody } from '@/utils/parseQuery'

import { prisma } from '../../../../../../prisma'

const commentIdSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999)
})

export const toggleCommentLike = async (
  input: z.infer<typeof commentIdSchema>,
  uid: number
) => {
  const { commentId } = input

  const comment = await prisma.resourceComment.findUnique({
    where: { id: commentId },
    include: { resource: { select: { db_id: true } } }
  })
  if (!comment) {
    return '未找到评论'
  }

  if (comment.user_id === uid) {
    return '您不能给自己点赞'
  }

  const existingLike = await prisma.userResourceCommentLikeRelation.findUnique({
    where: {
      user_id_comment_id: {
        user_id: uid,
        comment_id: commentId
      }
    }
  })

  return await prisma.$transaction(async (prisma) => {
    if (existingLike) {
      await prisma.userResourceCommentLikeRelation.delete({
        where: {
          user_id_comment_id: {
            user_id: uid,
            comment_id: commentId
          }
        }
      })
    } else {
      await prisma.userResourceCommentLikeRelation.create({
        data: {
          user_id: uid,
          comment_id: commentId
        }
      })
    }

    await createDedupMessage({
      type: 'like',
      content: `点赞了您的评论! -> ${comment.content.slice(0, 107)}`,
      sender_id: uid,
      recipient_id: comment.user_id,
      link: `/${comment.resource.db_id}`
    })

    return !existingLike
  })
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, commentIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const response = await toggleCommentLike(input, payload.uid)

  return NextResponse.json(response)
}
