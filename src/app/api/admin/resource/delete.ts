import { z } from 'zod'

import { deleteFolderFromS3 } from '@/lib/s3'
import { getRouteByDbId } from '@/utils/router'
import { adminDeleteResourceSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export const deleteResource = async (
  input: z.infer<typeof adminDeleteResourceSchema>
) => {
  try {
    // 检查资源是否存在，同时获取系列关联信息
    const existingResource = await prisma.resource.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        db_id: true,
        series_relations: {
          select: {
            series: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!existingResource) {
      return '资源不存在'
    }

    // 获取关联的系列信息
    const relatedSeries = existingResource.series_relations.map(rel => rel.series)
    
    // 检查是否有系列只包含这一个资源
    const criticalSeries = []
    for (const series of relatedSeries) {
      const resourceCount = await prisma.resourceSeriesRelation.count({
        where: { series_id: series.id }
      })
      
      if (resourceCount === 1) {
        criticalSeries.push(series.name)
      }
    }

    // 如果有系列只包含这一个资源，需要警告
    if (criticalSeries.length > 0) {
      return `无法删除资源，以下系列将变为空系列：${criticalSeries.join(', ')}。请先为这些系列添加其他资源或删除这些系列。`
    }

    // 删除资源（级联删除会自动处理相关数据，包括系列关联）
    await prisma.resource.delete({
      where: { id: input.id }
    })

    // 删除S3中的资源
    await deleteFolderFromS3(`resource${getRouteByDbId(existingResource.db_id)}`)

    // 构建删除成功消息
    let message = `资源 "${existingResource.name}" 已成功删除`
    if (relatedSeries.length > 0) {
      message += `，同时从 ${relatedSeries.length} 个系列中移除了该资源`
    }

    return {
      success: true,
      message,
      removedFromSeries: relatedSeries.map(s => s.name)
    }
  } catch (error) {
    console.error('删除资源失败:', error)
    return error instanceof Error ? error.message : '删除资源时发生未知错误'
  }
} 