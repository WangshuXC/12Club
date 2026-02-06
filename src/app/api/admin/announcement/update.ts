import { z } from 'zod'

import { adminUpdateAnnouncementSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const updateAnnouncement = async (
  input: z.infer<typeof adminUpdateAnnouncementSchema>
) => {
  const { id, title, content } = input

  try {
    // 检查公告是否存在
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    })

    if (!existingAnnouncement) {
      return '公告不存在'
    }

    // 更新公告
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content
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
      message: '公告更新成功',
      data: {
        id: updatedAnnouncement.id,
        title: updatedAnnouncement.title,
        content: updatedAnnouncement.content,
        created: updatedAnnouncement.created,
        updated: updatedAnnouncement.updated,
        user: updatedAnnouncement.user
      }
    }
  } catch (error) {
    console.error('更新公告失败:', error)
    return '更新公告失败'
  }
} 