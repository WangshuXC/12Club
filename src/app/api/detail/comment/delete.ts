import { z } from 'zod'

import { processComments } from '@/utils/processComments'

import { prisma } from '../../../../../prisma'

const commentIdSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999),
  resourceId: z.coerce.number().min(1).max(9999999)
})

const deleteCommentWithReplies = async (commentId: number) => {
  try {
    // 查找所有子评论
    const childComments = await prisma.resourceComment.findMany({
      where: { parent_id: commentId },
      select: { id: true }
    })

    // 递归删除所有子评论
    if (childComments && childComments.length > 0) {
      for (const child of childComments) {
        await deleteCommentWithReplies(child.id)
      }
    }

    // 删除当前评论
    await prisma.resourceComment.delete({
      where: { id: commentId }
    })

    return {}
  } catch (error) {
    console.error('删除评论失败:', error)
    return error
  }
}

export const deleteResourceComment = async (
  input: z.infer<typeof commentIdSchema>,
  uid: number,
  userRole: number
) => {
  try {
    // 查找评论信息
    const comment = await prisma.resourceComment.findUnique({
      where: { id: input?.commentId },
      select: { user_id: true }
    })

    if (!comment) {
      return '未找到对应的评论'
    }

    // 权限检查：只有评论作者本人或管理员可以删除
    if (comment.user_id !== uid && userRole < 3) {
      return '您没有权限删除该评论'
    }

    // 递归删除评论及其回复
    await deleteCommentWithReplies(input.commentId)

    // 获取删除后的评论列表
    const comments = await prisma.resourceComment.findMany({
      where: { resource_id: input.resourceId },
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
        },
      },
      orderBy: {
        created: 'desc'
      }
    })

    const processedComments = processComments(comments)

    return { comment: processedComments }
  } catch (error) {
    console.error('删除评论失败:', error)
    return error instanceof Error ? error.message : '删除评论时发生未知错误'
  }
}
