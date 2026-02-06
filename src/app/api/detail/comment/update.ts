import { z } from 'zod'

import { processComments } from '@/utils/processComments'
import { resourceCommentUpdateSchema } from '@/validations/comment'

import { prisma } from '../../../../../prisma'

export const updateComment = async (
  input: z.infer<typeof resourceCommentUpdateSchema>,
  uid: number,
  userRole: number
) => {
  const { commentId, content } = input

  const comment = await prisma.resourceComment.findUnique({
    where: { id: commentId }
  })
  if (!comment) {
    return '未找到该评论'
  }

  const commentUserUid = comment.user_id
  if (comment.user_id !== uid && userRole < 3) {
    return '您没有权限更改该评论'
  }

  await prisma.resourceComment.update({
    where: { id: commentId, user_id: commentUserUid },
    data: {
      content,
      edit: Date.now().toString()
    },
    include: {
      user: true,
      likes: {
        include: {
          user: true
        }
      }
    }
  })

  const comments = await prisma.resourceComment.findMany({
    where: { resource_id: comment.resource_id },
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
