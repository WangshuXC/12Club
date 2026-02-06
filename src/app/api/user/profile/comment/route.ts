import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { getUserInfoSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'

import type { UserComment } from '@/types/api/user'

export const getUserComment = async (
  input: z.infer<typeof getUserInfoSchema>
) => {
  const { uid, page, limit } = input
  const offset = (page - 1) * limit

  try {
    // 获取评论数据
    const commentData = await prisma.resourceComment.findMany({
      where: { user_id: uid },
      skip: offset,
      take: limit,
      orderBy: { created: 'asc' },
      include: {
        resource: {
          select: {
            db_id: true,
            name: true
          }
        },
        parent: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    // 计数查询
    const count = await prisma.resourceComment.count({
      where: { user_id: uid }
    })

    const comments: UserComment[] = commentData.map((comment) => ({
      id: comment.id,
      resourceId: comment.resource_id,
      dbId: comment.resource.db_id,
      content: comment.content,
      userId: uid,
      like: comment._count.likes,
      resourceName: comment.resource.name,
      created: comment.created.toISOString(),
      quotedUserUid: comment?.parent?.user.id || null,
      quotedUsername: comment?.parent?.user.name || null
    }))

    return { comments: comments, total: count }
  } catch (error) {
    console.error('获取用户评论失败:', error)
    return { comments: [], total: 0 }
  }
}

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, getUserInfoSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登陆失效')
  }

  const response = await getUserComment(input)

  return NextResponse.json(response)
}
