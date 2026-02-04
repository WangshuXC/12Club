import { z } from 'zod'
import { prisma } from '../../../../../prisma'
import { adminCreateSeriesSchema } from '@/validations/admin'

export const createSeries = async (
    input: z.infer<typeof adminCreateSeriesSchema>,
    userId: number
) => {
    try {
        // 检查系列名称是否已存在
        const existingSeries = await prisma.resourceSeries.findFirst({
            where: {
                name: input.name
            },
            select: {
                id: true,
                name: true
            }
        })

        console.log(input)

        if (existingSeries) {
            return `系列名称 "${input.name}" 已存在，请使用其他名称`
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

        if (resources.length !== input.dbIds.length) {
            const foundDbIds = resources.map(r => r.db_id)
            const missingDbIds = input.dbIds.filter(dbId => !foundDbIds.includes(dbId))
            return `以下资源不存在: ${missingDbIds.join(', ')}`
        }

        // 使用事务创建系列和关联关系
        const result = await prisma.$transaction(async (tx) => {
            // 创建系列
            const series = await tx.resourceSeries.create({
                data: {
                    name: input.name,
                    description: input.description || '',
                    user_id: userId
                }
            })

            // 创建资源关联关系
            await tx.resourceSeriesRelation.createMany({
                data: resources.map(resource => ({
                    series_id: series.id,
                    resource_id: resource.id
                }))
            })

            return series
        })

        return {
            success: true,
            message: `系列 "${input.name}" 创建成功`,
            seriesId: result.id
        }
    } catch (error) {
        console.error('创建系列失败:', error)
        return error instanceof Error ? error.message : '创建系列时发生未知错误'
    }
}