import { z } from 'zod'

import { adminCreateResourcePlayLinkSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

export const createResourcePlayLink = async (
  input: z.infer<typeof adminCreateResourcePlayLinkSchema>,
  userId: number
) => {
  const { resourceId, accordion, showAccordion, link } = input

  try {
    // 检查资源是否存在
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, accordion_total: true }
    })

    if (!resource) {
      return {
        success: false,
        message: '资源不存在'
      }
    }

    // 检查该资源的该集数是否已经存在播放链接
    const existingLink = await prisma.resourcePlayLink.findFirst({
      where: {
        resource_id: resourceId,
        accordion: accordion
      }
    })

    if (existingLink) {
      return {
        success: false,
        message: `第 ${accordion} 集的播放链接已存在`
      }
    }

    // 创建播放链接
    const playLink = await prisma.resourcePlayLink.create({
      data: {
        resource_id: resourceId,
        user_id: userId,
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
      where: { id: playLink.resource_id },
      data: { updated: playLink.updated }
    })

    const formattedPlayLink: ResourcePlayLink = {
      id: playLink.id,
      accordion: playLink.accordion,
      show_accordion: playLink.show_accordion,
      resource_id: playLink.resource_id,
      user_id: playLink.user_id,
      link: playLink.link,
      created: playLink.created,
      updated: playLink.updated,
      user: playLink.user
    }

    return {
      success: true,
      data: formattedPlayLink,
      message: '播放链接添加成功'
    }
  } catch (error) {
    console.error('创建播放链接失败:', error)
    
    // 处理特定的 Prisma 错误
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any }
      
      if (prismaError.code === 'P2002') {
        // 唯一约束违反
        if (prismaError.meta?.target?.includes('id')) {
          return {
            success: false,
            message: '数据库序列错误，请联系管理员修复'
          }
        } else {
          return {
            success: false,
            message: '该集数的播放链接已存在'
          }
        }
      }
      
      if (prismaError.code === 'P2003') {
        return {
          success: false,
          message: '关联的资源或用户不存在'
        }
      }
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : '创建播放链接时发生未知错误'
    }
  }
} 