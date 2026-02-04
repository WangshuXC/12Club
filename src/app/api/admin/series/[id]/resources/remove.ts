import { z } from 'zod'
import { prisma } from '../../../../../../../prisma'
import { adminRemoveSeriesFromResourceSchema } from '@/validations/admin'

// 解析 dbId 获取资源类型和数字 ID
const parseDbId = (dbId: string): { type: string; id: number } | null => {
  const match = dbId.match(/^([acgn])(\d+)$/)
  if (!match) return null
  return { type: match[1], id: parseInt(match[2]) }
}

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

    // 解析 dbId 获取资源 ID
    const parsed = parseDbId(input.dbId)
    if (!parsed) {
      return `dbId 格式不正确: ${input.dbId}`
    }

    const resourceId = parsed.id

    // 检查资源是否在系列中
    const existingRelation = await prisma.resourceSeriesRelation.findFirst({
      where: {
        series_id: input.seriesId,
        resource_id: resourceId
      },
      select: {
        id: true,
        resource: {
          select: {
            name: true
          }
        }
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
      message: `成功从系列 "${existingSeries.name}" 中移除资源 "${existingRelation.resource.name}"`
    }
  } catch (error) {
    console.error('从系列移除资源失败:', error)
    return error instanceof Error ? error.message : '从系列移除资源时发生未知错误'
  }
}