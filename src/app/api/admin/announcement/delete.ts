import { z } from 'zod'

import { adminDeleteAnnouncementSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const deleteAnnouncement = async (
  input: z.infer<typeof adminDeleteAnnouncementSchema>
) => {
  const { id } = input

  try {
    // 检查公告是否存在
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    })

    if (!existingAnnouncement) {
      return '公告不存在'
    }

    // 删除公告
    await prisma.announcement.delete({
      where: { id }
    })

    return {
      message: '公告删除成功'
    }
  } catch (error) {
    console.error('删除公告失败:', error)
    return '删除公告失败'
  }
}
