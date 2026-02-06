import { z } from 'zod'

import { adminUpdateResourcePlayLinkSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

export const updateResourcePlayLink = async (
  input: z.infer<typeof adminUpdateResourcePlayLinkSchema>
) => {
  const { id, accordion, showAccordion, link } = input

  try {
    // 检查播放链接是否存在
    const existingPlayLink = await prisma.resourcePlayLink.findUnique({
      where: { id },
      include: {
        resource: {
          select: {
            id: true,
            accordion_total: true
          }
        }
      }
    })

    if (!existingPlayLink) {
      return {
        success: false,
        message: '播放链接不存在'
      }
    }

    // 如果集数改变了，检查新集数是否已被其他播放链接占用
    if (accordion !== existingPlayLink.accordion) {
      const duplicateLink = await prisma.resourcePlayLink.findFirst({
        where: {
          resource_id: existingPlayLink.resource_id,
          accordion: accordion,
          id: { not: id } // 排除当前记录
        }
      })

      if (duplicateLink) {
        return {
          success: false,
          message: `第 ${accordion} 集的播放链接已存在`
        }
      }
    }

    // 更新播放链接
    const updatedPlayLink = await prisma.resourcePlayLink.update({
      where: { id },
      data: {
        accordion,
        show_accordion: showAccordion || '',
        link
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

    await prisma.resource.update({
      where: { id: updatedPlayLink.resource_id },
      data: { updated: updatedPlayLink.updated }
    })

    const formattedPlayLink: ResourcePlayLink = {
      id: updatedPlayLink.id,
      accordion: updatedPlayLink.accordion,
      show_accordion: updatedPlayLink.show_accordion,
      resource_id: updatedPlayLink.resource_id,
      user_id: updatedPlayLink.user_id,
      link: updatedPlayLink.link,
      created: updatedPlayLink.created,
      updated: updatedPlayLink.updated,
      user: updatedPlayLink.user
    }

    return {
      success: true,
      data: formattedPlayLink,
      message: '播放链接更新成功'
    }
  } catch (error) {
    console.error('更新播放链接失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '更新播放链接时发生未知错误'
    }
  }
} 