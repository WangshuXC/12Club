import { z } from 'zod'

import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { AdminAnnouncement } from '@/types/api/admin'

export const getAnnouncementInfo = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit, search } = input
  const offset = (page - 1) * limit

  try {
    // 构建查询条件 - 支持搜索公告标题和内容
    const whereCondition = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    // 获取公告数据
    const [announcementsData, total] = await Promise.all([
      prisma.announcement.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy: { created: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.announcement.count({
        where: whereCondition
      })
    ])

    // 数据格式转换
    const announcements: AdminAnnouncement[] = announcementsData.map(
      (announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        created: announcement.created,
        updated: announcement.updated,
        user: {
          id: announcement.user.id,
          name: announcement.user.name,
          avatar: announcement.user.avatar
        }
      })
    )

    return {
      data: announcements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    return '获取公告列表失败'
  }
}
