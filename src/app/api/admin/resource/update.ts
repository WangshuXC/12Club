import { z } from 'zod'

import { getOpenlistToken } from '@/lib/openlist'
import { getRouteByDbId } from '@/utils/router'
import { adminUpdateResourceSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const renameResource = async (dbId: string, newName: string) => {
  const tokenResult = await getOpenlistToken()

  if (!tokenResult.success || !tokenResult.token) {
    return {
      success: false,
      message: tokenResult.message
    }
  }

  const openlistToken = tokenResult.token
  const path = `/resource${getRouteByDbId(dbId)}`
  const reName = await fetch(
    `${process.env.NEXT_OPENLIST_API_ADRESS}/fs/rename`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: openlistToken
      },
      body: JSON.stringify({
        path: path,
        name: newName
      })
    }
  )

  if (!reName.ok) {
    return {
      success: false,
      message: '重命名失败'
    }
  }

  return {
    success: true,
    message: '重命名成功'
  }
}

// 处理单个标签的创建或获取
const processTag = async (
  tagName: string,
  userId: number,
  resourceId: number
) => {
  const trimmedTagName = tagName.trim()

  if (!trimmedTagName) return

  // 查找或创建标签
  let tag = await prisma.resourceTag.findUnique({
    where: { name: trimmedTagName }
  })

  if (!tag) {
    tag = await prisma.resourceTag.create({
      data: {
        name: trimmedTagName,
        user_id: userId,
        count: 0
      }
    })
  }

  // 创建资源-标签关联
  await prisma.resourceTagRelation.create({
    data: {
      resource_id: resourceId,
      tag_id: tag.id
    }
  })

  // 更新标签计数
  await prisma.resourceTag.update({
    where: { id: tag.id },
    data: {
      count: { increment: 1 }
    }
  })
}

// 更新资源标签
const updateResourceTags = async (resourceId: number, tags: string[]) => {
  // 删除旧的标签关联
  await prisma.resourceTagRelation.deleteMany({
    where: { resource_id: resourceId }
  })

  if (tags.length === 0) return

  // 获取资源的用户ID
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { user_id: true }
  })

  if (!resource) return

  // 处理每个标签
  for (const tagName of tags) {
    await processTag(tagName, resource.user_id, resourceId)
  }
}

export const updateResource = async (
  input: z.infer<typeof adminUpdateResourceSchema>
) => {
  try {
    // 检查 dbId 是否与其他资源重复
    const existingResource = await prisma.resource.findFirst({
      where: {
        db_id: input.dbId,
        id: { not: input.id } // 排除当前正在更新的资源
      },
      select: {
        id: true,
        name: true
      }
    })

    if (existingResource) {
      return `${input.dbId} 已被资源${existingResource.name}使用，请使用其他 dbId`
    }

    const currentResource = await prisma.resource.findUnique({
      where: { id: input.id },
      select: {
        db_id: true,
        updated: true
      }
    })

    if (!currentResource) {
      return '资源不存在'
    }

    // 更新资源
    await prisma.resource.update({
      where: { id: input.id },
      data: {
        name: input.name,
        db_id: input.dbId,
        introduction: input.introduction,
        released: input.released,
        accordion_total: input.accordionTotal,
        language: [input.language], // 转换为数组格式存储
        status: input.status,
        author: input.author,
        image_url: `${process.env.IMAGE_BED_URL}/resource${getRouteByDbId(input.dbId)}/banner.avif`,
        translator: input.translator,
        updated: currentResource?.updated
      }
    })

    // 更新别名
    if (input.aliases) {
      // 删除旧别名
      await prisma.resourceAlias.deleteMany({
        where: { resource_id: input.id }
      })

      // 添加新别名
      if (input.aliases.length > 0) {
        await prisma.resourceAlias.createMany({
          data: input.aliases.map((name) => ({
            name: name.trim(),
            resource_id: input.id
          }))
        })
      }
    }

    // 更新标签
    if (input.tags !== undefined) {
      await updateResourceTags(input.id, input.tags)
    }

    if (input.dbId !== currentResource?.db_id) {
      const res = await renameResource(currentResource.db_id, input.dbId)
      if (!res.success) {
        return res.message
      }
    }

    return { success: true }
  } catch (error) {
    console.error('更新资源失败:', error)
    return error instanceof Error ? error.message : '更新资源时发生未知错误'
  }
}
