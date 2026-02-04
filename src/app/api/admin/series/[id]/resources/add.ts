import { z } from 'zod'
import { prisma } from '../../../../../../../prisma'
import { adminAddSeriesToResourceSchema } from '@/validations/admin'

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

        // 验证资源是否存在
        const resources = await prisma.resource.findMany({
            where: {
                db_id: {
                    in: input.dbIds
                }
            },
            select: {
                id: true,
                name: true,
                db_id: true
            }
        })

        // 检查是否有不存在的资源
        const foundDbIds = resources.map(r => r.db_id)
        const missingDbIds = input.dbIds.filter(dbId => !foundDbIds.includes(dbId))
        if (missingDbIds.length > 0) {
            return `以下资源不存在: ${missingDbIds.join(', ')}`
        }

        // 获取资源的整数 ID 列表
        const resourceIds = resources.map(r => r.id)

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
        const newResources = resources.filter(r => !existingResourceIds.includes(r.id))

        if (newResources.length === 0) {
            const existingNames = existingRelations.map(rel => rel.resource.name)
            return `所有资源都已在系列中: ${existingNames.join(', ')}`
        }

        // 添加新的资源关联
        await prisma.resourceSeriesRelation.createMany({
            data: newResources.map(resource => ({
                series_id: input.seriesId,
                resource_id: resource.id
            }))
        })

        const skippedResources = resources.filter(r => existingResourceIds.includes(r.id))

        let message = `成功添加 ${newResources.length} 个资源到系列 "${existingSeries.name}"`
        if (skippedResources.length > 0) {
            message += `，跳过 ${skippedResources.length} 个已存在的资源`
        }

        return {
            success: true,
            message,
            added: newResources.length,
            skipped: skippedResources.length
        }
    } catch (error) {
        console.error('添加资源到系列失败:', error)
        return error instanceof Error ? error.message : '添加资源到系列时发生未知错误'
    }
}