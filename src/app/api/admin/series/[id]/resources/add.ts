import { z } from 'zod'
import { prisma } from '../../../../../../../prisma'
import { adminAddSeriesToResourceSchema } from '@/validations/admin'

// 解析 dbId 获取资源类型和数字 ID
const parseDbId = (dbId: string): { type: string; id: number } | null => {
  const match = dbId.match(/^([acgn])(\d+)$/)
  if (!match) return null
  return { type: match[1], id: parseInt(match[2]) }
}

export const addResourcesToSeries = async (
  input: z.infer<typeof adminAddSeriesToResourceSchema>
) => {
  try {
    // 检查系列是否存在
    const existingSeries = await prisma.resourceSeries.findUnique({
      where: { id: input.seriesId },
      select: {
        id: true,
        name: true
      }
    })

    if (!existingSeries) {
      return '系列不存在'
    }

    // 解析 dbIds 获取资源 ID
    const parsedIds = input.dbIds.map(dbId => parseDbId(dbId))
    const invalidDbIds = input.dbIds.filter((_, i) => !parsedIds[i])
    if (invalidDbIds.length > 0) {
      return `以下 dbId 格式不正确: ${invalidDbIds.join(', ')}`
    }

    const resourceIds = parsedIds.map(p => p!.id)

    // 验证资源是否存在
    const resources = await prisma.resource.findMany({
      where: {
        id: {
          in: resourceIds
        }
      },
      select: {
        id: true,
        name: true,
        dbId: true
      }
    })

    if (resources.length !== resourceIds.length) {
      const foundDbIds = resources.map(r => r.dbId)
      const missingDbIds = input.dbIds.filter(dbId => !foundDbIds.includes(dbId))
      return `以下资源不存在: ${missingDbIds.join(', ')}`
    }

    // 检查哪些资源已经在系列中
    const existingRelations = await prisma.resourceSeriesRelation.findMany({
      where: {
        series_id: input.seriesId,
        resource_id: {
          in: resourceIds
        }
      },
      select: {
        resource_id: true,
        resource: {
          select: {
            name: true
          }
        }
      }
    })

    const existingResourceIds = existingRelations.map(rel => rel.resource_id)
    const newResourceIds = resourceIds.filter(id => !existingResourceIds.includes(id))

    if (newResourceIds.length === 0) {
      const existingNames = existingRelations.map(rel => rel.resource.name)
      return `所有资源都已在系列中: ${existingNames.join(', ')}`
    }

    // 添加新的资源关联
    await prisma.resourceSeriesRelation.createMany({
      data: newResourceIds.map(resourceId => ({
        series_id: input.seriesId,
        resource_id: resourceId
      }))
    })

    const addedResources = resources.filter(r => newResourceIds.includes(r.id))
    const skippedResources = resources.filter(r => existingResourceIds.includes(r.id))

    let message = `成功添加 ${addedResources.length} 个资源到系列 "${existingSeries.name}"`
    if (skippedResources.length > 0) {
      message += `，跳过 ${skippedResources.length} 个已存在的资源`
    }

    return {
      success: true,
      message,
      added: addedResources.length,
      skipped: skippedResources.length
    }
  } catch (error) {
    console.error('添加资源到系列失败:', error)
    return error instanceof Error ? error.message : '添加资源到系列时发生未知错误'
  }
}