import { z } from 'zod'

import { createPatchResource } from '@/app/api/patch/create'
import { getRouteByDbId } from '@/utils/router'
import { adminAutoCreateResourcePlayLinkSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

interface Resource {
    id: number
    accordion_total: number
    name: string
    language: string[]
    db_id: string
}

/**
 * 创建或更新资源的 Patch 下载资源
 * @param resource - 资源信息
 * @param userId - 用户ID
 * @returns 返回操作结果，包含是否已存在和是否创建成功
 */
export const createOrUpdatePatchResource = async (
  resource: Resource,
  userId: number
): Promise<{ success: boolean; message?: string; isNew: boolean }> => {
  try {
    /**
         * 为什么这里的路径不带resource?
         * 因为openlist的访客路径的根目录是/resource，所以不需要带resource
         */
    const existingPatch = await prisma.resourcePatch.findFirst({
      where: {
        resource_id: resource.id,
        content: `//12club.nankai.edu.cn/openlist${getRouteByDbId(resource.db_id)}`
      }
    })

    // 如果已存在，直接返回成功
    if (existingPatch) {
      return {
        success: true,
        isNew: false
      }
    }

    // 不存在则创建新的 Patch 资源
    const patchRes = await createPatchResource(
      {
        dbId: resource.db_id,
        language: resource.language,
        content: `//12club.nankai.edu.cn/openlist${getRouteByDbId(resource.db_id)}`,
        storage: 'alist',
        section: 'club',
        name: `${resource.name} - 12club资源`,
        code: '',
        hash: '',
        size: '',
        password: '',
        note: ''
      },
      userId
    )

    if (typeof patchRes === 'string') {
      return {
        success: false,
        message: patchRes,
        isNew: false
      }
    }

    return {
      success: true,
      isNew: true
    }
  } catch (error) {
    console.error('创建或更新 Patch 资源失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '创建 Patch 资源失败',
      isNew: false
    }
  }
}

/**
 * 批量创建在线播放链接
 * @param resourceId - 资源ID
 * @param linkList - 播放链接列表
 * @param userId - 用户ID
 * @returns 返回操作结果，包含创建的播放链接和错误信息
 */
export const createPlayLinks = async (
  resourceId: number,
  linkList: string[],
  userId: number
): Promise<{
    success: boolean
    message?: string
    playLinks: ResourcePlayLink[]
    errors: string[]
    newLinksCount: number
}> => {
  try {
    // 检查是否已有播放链接
    const currentLinks = await prisma.resourcePlayLink.findMany({
      where: {
        resource_id: resourceId
      },
      select: { accordion: true, link: true }
    })

    const errors: string[] = []
    const removeHttpPrefix = (url: string) => {
      return url.replace(/^https?:/, '')
    }

    let newLinksCount = 0

    // 批量创建播放链接
    for (let i = 0; i < linkList.length; i++) {
      const link = linkList[i]
      const accordion = i + 1

      try {
        // 检查链接是否已存在
        if (
          currentLinks.some(
            (currentLink) => currentLink.link === removeHttpPrefix(link)
          )
        ) {
          continue
        }

        await prisma.resourcePlayLink.create({
          data: {
            resource_id: resourceId,
            user_id: userId,
            accordion,
            show_accordion: accordion.toString(),
            link: removeHttpPrefix(link)
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

        newLinksCount++
      } catch (error) {
        console.error(`创建第 ${accordion} 集播放链接失败:`, error)
        errors.push(
          `第 ${accordion} 集: ${error instanceof Error ? error.message : '创建失败'}`
        )
      }
    }

    // 如果有新增链接，更新资源的集数总数
    if (linkList.length > currentLinks.length) {
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          accordion_total: linkList.length
        }
      })
    }

    // 获取所有播放链接
    const resultPlayLinks = await prisma.resourcePlayLink.findMany({
      where: {
        resource_id: resourceId
      },
      select: {
        id: true,
        accordion: true,
        show_accordion: true,
        resource_id: true,
        user_id: true,
        link: true,
        created: true,
        updated: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    const formattedResultPlayLinks: ResourcePlayLink[] = resultPlayLinks.map(
      (playLink) => ({
        id: playLink.id,
        accordion: playLink.accordion,
        show_accordion: playLink.show_accordion,
        resource_id: playLink.resource_id,
        user_id: playLink.user_id,
        link: playLink.link,
        created: playLink.created,
        updated: playLink.updated,
        user: playLink.user
      })
    )

    return {
      success: errors.length === 0,
      playLinks: formattedResultPlayLinks,
      errors,
      newLinksCount
    }
  } catch (error) {
    console.error('批量创建播放链接失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '批量创建播放链接失败',
      playLinks: [],
      errors: [],
      newLinksCount: 0
    }
  }
}

/**
 * 批量创建播放链接和资源补丁
 * @param input - 包含资源ID、播放链接列表和更新模式的输入参数
 * @param input.resourceId - 资源ID
 * @param input.linkList - 播放链接列表（当 onlyUpdatePatch 为 false 时必填）
 * @param input.onlyUpdatePatch - 是否只更新补丁而不创建播放链接（默认为 false）
 * @param userId - 用户ID
 * @returns 返回操作结果，包括成功状态、消息和数据
 */
export const autoCreateResourcePlayLinks = async (
  input: z.infer<typeof adminAutoCreateResourcePlayLinkSchema>,
  userId: number
) => {
  const { resourceId, linkList, onlyUpdatePatch = false } = input

  try {
    // 检查资源是否存在
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        accordion_total: true,
        name: true,
        language: true,
        db_id: true
      }
    })

    if (!resource) {
      return {
        success: false,
        message: '资源不存在'
      }
    }

    // 1. 创建或更新 Patch 资源
    const patchResult = await createOrUpdatePatchResource(resource, userId)

    if (!patchResult.success) {
      return {
        success: false,
        message: patchResult.message || '创建 Patch 资源失败'
      }
    }

    // 如果只更新 Patch，直接返回成功
    if (onlyUpdatePatch) {
      return {
        success: true,
        message: `成功${patchResult.isNew ? '创建' : '更新'}下载资源`,
        data: {
          created: 0,
          failed: 0,
          details: []
        }
      }
    }

    // 2. 批量创建在线播放链接
    const playLinkResult = await createPlayLinks(resourceId, linkList!, userId)

    if (!playLinkResult.success) {
      return {
        success: false,
        message: playLinkResult.message || '批量创建播放链接失败'
      }
    }

    if (playLinkResult.errors.length > 0) {
      return {
        success: false,
        message: `批量创建部分失败：\n${playLinkResult.errors.join('\n')}`,
        data: {
          created: playLinkResult.playLinks.length,
          failed: playLinkResult.errors.length,
          details: playLinkResult.errors
        }
      }
    }

    return {
      success: true,
      message: `成功${patchResult.isNew ? '创建' + playLinkResult.playLinks.length : '更新' + playLinkResult.newLinksCount} 个播放链接${patchResult.isNew ? ' 和 下载资源' : ''}`,
      data: {
        created: playLinkResult.playLinks.length,
        failed: 0,
        details: playLinkResult.playLinks
      }
    }
  } catch (error) {
    console.error('批量创建播放链接失败:', error)

    // 处理特定的 Prisma 错误
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: any }

      if (prismaError.code === 'P2002') {
        return {
          success: false,
          message: '播放链接存在重复，请检查集数设置'
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
      message:
                error instanceof Error
                  ? error.message
                  : '批量创建播放链接时发生未知错误'
    }
  }
}
