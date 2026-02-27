import { z } from 'zod'

import { adminCreateAnnouncementSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const createAnnouncement = async (
  input: z.infer<typeof adminCreateAnnouncementSchema>,
  userId: number
) => {
  const { title, content } = input

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        user_id: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return {
      message: '公告创建成功',
      data: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        created: announcement.created,
        updated: announcement.updated,
        user: announcement.user
      }
    }
  } catch (error) {
    console.error('创建公告失败:', error)
    return '创建公告失败'
  }
}
