import { z } from 'zod'

import { patchCommentUpdateSchema } from '@/validations/patch'

import { prisma } from '../../../../../prisma'

export const updateComment = async (
  input: z.infer<typeof patchCommentUpdateSchema>,
  uid: number
) => {
  const comment = await prisma.resourceComment.findUnique({
    where: { id: input.commentId }
  })
  if (!comment) {
    return '未找到对应的评论'
  }

  const admin = await prisma.user.findUnique({ where: { id: uid } })
  if (!admin) {
    return '未找到该管理员'
  }

  const { commentId, content } = input

  return await prisma.$transaction(async (prisma) => {
    await prisma.resourceComment.update({
      where: { id: commentId },
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

    // TODO: 添加管理员日志功能
    // await prisma.adminLog.create({
    //   data: {
    //     type: 'update',
    //     user_id: uid,
    //     content: `管理员 ${admin.name} 更新了一条评论的内容\n原评论: ${JSON.stringify(comment)}`
    //   }
    // })

    return {}
  })
}
