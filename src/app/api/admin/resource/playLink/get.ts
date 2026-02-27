import { z } from 'zod'

import { adminGetResourcePlayLinksSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

export const getResourcePlayLinks = async (
  input: z.infer<typeof adminGetResourcePlayLinksSchema>
) => {
  const { resourceId } = input

  try {
    const playLinks = await prisma.resourcePlayLink.findMany({
      where: {
        resource_id: resourceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        created: 'asc'
      }
    })

    const formattedPlayLinks: ResourcePlayLink[] = playLinks.map((link) => ({
      id: link.id,
      accordion: link.accordion,
      show_accordion: link.show_accordion
        ? link.show_accordion
        : link.accordion.toString(),
      resource_id: link.resource_id,
      user_id: link.user_id,
      link: link.link,
      created: link.created,
      updated: link.updated,
      user: link.user
    }))

    return {
      success: true,
      data: formattedPlayLinks
    }
  } catch (error) {
    console.error('获取播放链接列表失败:', error)
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : '获取播放链接列表时发生未知错误'
    }
  }
}
