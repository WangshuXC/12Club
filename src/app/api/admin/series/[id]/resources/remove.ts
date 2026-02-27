import { z } from 'zod'

import { adminRemoveSeriesFromResourceSchema } from '@/validations/admin'

import { prisma } from '../../../../../../../prisma'

export const removeResourcesFromSeries = async (
  input: z.infer<typeof adminRemoveSeriesFromResourceSchema>
) => {
  try {
    // 检查系列是否存在
    const existingSeries = await prisma.resourceSeries.findUnique({
      where: { id: input.seriesId },
      select: {
        id: true,
        name: true,
        resources: {
          select: {
            resource_id: true
          }
        }
      }
    })

    if (!existingSeries) {
      return '系列不存在'
    }

    // 先通过 db_id 查找资源的整数 id
    const resource = await prisma.resource.findUnique({
      where: { db_id: input.dbId },
      select: { id: true, name: true }
    })

    if (!resource) {
      return '资源不存在'
    }

    // 检查资源是否在系列中
    const existingRelation = await prisma.resourceSeriesRelation.findFirst({
      where: {
        series_id: input.seriesId,
        resource_id: resource.id
      },
      select: {
        id: true
      }
    })

    if (!existingRelation) {
      return '该资源不在此系列中'
    }

    // 检查移除后系列是否还有资源
    const remainingResourceCount = existingSeries.resources.length - 1
    if (remainingResourceCount === 0) {
      return '不能移除所有资源，系列至少需要包含一个资源'
    }

    // 移除资源关联
    await prisma.resourceSeriesRelation.delete({
      where: {
        id: existingRelation.id
      }
    })

    return {
      success: true,
      message: `成功从系列 "${existingSeries.name}" 中移除资源 "${resource.name}"`
    }
  } catch (error) {
    console.error('从系列移除资源失败:', error)
    return error instanceof Error
      ? error.message
      : '从系列移除资源时发生未知错误'
  }
}
