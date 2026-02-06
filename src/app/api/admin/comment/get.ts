import { z } from 'zod'

import { markdownToText } from '@/utils/markdownToText'
import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { AdminComment } from '@/types/api/admin'

export const getComment = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit, search } = input
  const offset = (page - 1) * limit

  const where = search
    ? {
      OR: [
        {
          content: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive' as const
            }
          }
        }
      ]
    }
    : {}

  const [data, total] = await Promise.all([
    prisma.resourceComment.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { created: 'desc' },
      include: {
        resource: {
          select: {
            name: true,
            db_id: true
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
      }
    }),
    prisma.resourceComment.count({ where })
  ])

  const comments: AdminComment[] = data.map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    resourceId: comment.resource_id,
    content: markdownToText(comment.content).slice(0, 233),
    created: comment.created,
    user: comment.user,
    resource: {
      name: comment.resource.name,
      dbId: comment.resource.db_id
    },
    likeCount: comment._count.likes,
    parentId: comment.parent_id || undefined
  }))

  return { comments, total }
}
