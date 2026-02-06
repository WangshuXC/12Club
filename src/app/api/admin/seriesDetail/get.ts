import { z } from 'zod'

import { adminGetSeriesDetailSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { AdminSeries } from '@/types/api/admin'

export const getSeriesDetail = async (
  input: z.infer<typeof adminGetSeriesDetailSchema>
) => {
  try {
    const item = await prisma.resourceSeries.findUnique({
      where: { id: input.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        resources: {
          select: {
            id: true,
            resource: {
              select: {
                id: true,
                db_id: true,
                name: true,
                image_url: true,
                type: true,
                status: true,
                created: true
              }
            }
          }
        }
      }
    })

    if (!item) {
      return '系列不存在'
    }

    const series: AdminSeries = {
      id: item.id,
      name: item.name,
      description: item.description,
      created: item.created,
      updated: item.updated,
      user: item.user,
      resourceCount: item.resources.length,
      resources: item.resources.map(rel => ({
        id: rel.resource.id,
        dbId: rel.resource.db_id,
        name: rel.resource.name,
        banner: rel.resource.image_url,
        type: rel.resource.type,
        status: rel.resource.status,
        created: rel.resource.created
      }))
    }

    return { series }
  } catch (error) {
    console.error('获取系列详情失败:', error)
    return error instanceof Error ? error.message : '获取系列详情时发生未知错误'
  }
}
