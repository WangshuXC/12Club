import { z } from 'zod'

import { adminGetSeriesSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { AdminSeries } from '@/types/api/admin'

export const getSeries = async (
  input: z.infer<typeof adminGetSeriesSchema>
) => {
  const { page, limit, search, sortField, sortOrder } = input
  const offset = (page - 1) * limit

  // 构建查询条件
  const whereConditions = []

  // 添加搜索条件
  if (search) {
    whereConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    })
  }

  // 构建最终的 where 条件
  const where =
    whereConditions.length > 0
      ? whereConditions.length === 1
        ? whereConditions[0]
        : { AND: whereConditions }
      : {}

  // 构建排序条件
  let orderBy: any = {}

  // 处理关联计数排序
  if (sortField === 'resource_count') {
    orderBy = {
      resources: {
        _count: sortOrder
      }
    }
  } else {
    // 普通字段排序
    orderBy[sortField] = sortOrder
  }

  try {
    const [data, total] = await Promise.all([
      prisma.resourceSeries.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: orderBy,
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
                  created: true,
                  released: true
                }
              }
            },
            orderBy: {
              resource: {
                released: 'asc'
              }
            }
          }
        }
      }),
      prisma.resourceSeries.count({ where })
    ])

    const series: AdminSeries[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      created: item.created,
      updated: item.updated,
      user: item.user,
      resourceCount: item.resources.length,
      resources: item.resources.map((rel) => ({
        id: rel.resource.id,
        dbId: rel.resource.db_id,
        name: rel.resource.name,
        banner: rel.resource.image_url,
        type: rel.resource.type,
        status: rel.resource.status,
        created: rel.resource.created
      }))
    }))

    return { series, total }
  } catch (error) {
    console.error('获取系列列表失败:', error)
    return error instanceof Error ? error.message : '获取系列列表时发生未知错误'
  }
}
