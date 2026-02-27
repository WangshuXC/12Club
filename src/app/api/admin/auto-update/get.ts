import { z } from 'zod'

import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

export interface AutoUpdateResource {
  id: number
  resourceId: number
  resourceName: string
  resourceDbId: string
  resourceBanner: string
  status: number
  lastUpdateTime: Date | null
  accordionTotal: number
  created: Date
  updated: Date
  user: {
    id: number
    name: string
    avatar: string | null
  }
}

export const getAutoUpdateResources = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit, search, types } = input
  const offset = (page - 1) * limit

  // 构建资源查询条件
  const resourceWhereConditions = []

  // 添加搜索条件
  if (search) {
    resourceWhereConditions.push({
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          db_id: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    })
  }

  // 添加类型过滤条件
  if (types && types.length > 0) {
    resourceWhereConditions.push({
      OR: types.map((type) => ({
        db_id: {
          startsWith: type
        }
      }))
    })
  }

  // 构建最终的 where 条件
  const resourceWhere =
    resourceWhereConditions.length > 0
      ? resourceWhereConditions.length === 1
        ? resourceWhereConditions[0]
        : { AND: resourceWhereConditions }
      : {}

  try {
    const [data, total] = await Promise.all([
      prisma.resourceAutoUpdate.findMany({
        where: {
          resource: resourceWhere
        },
        take: limit,
        skip: offset,
        orderBy: { created: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          resource: {
            select: {
              id: true,
              name: true,
              db_id: true,
              image_url: true,
              accordion_total: true
            }
          }
        }
      }),
      prisma.resourceAutoUpdate.count({
        where: {
          resource: resourceWhere
        }
      })
    ])

    const resources: AutoUpdateResource[] = data.map((item) => ({
      id: item.id,
      resourceId: item.resource_id,
      resourceName: item.resource.name,
      resourceDbId: item.resource.db_id,
      resourceBanner: item.resource.image_url,
      status: item.status,
      lastUpdateTime: item.last_update_time,
      accordionTotal: item.resource.accordion_total,
      created: item.created,
      updated: item.updated,
      user: item.user
    }))

    return { resources, total }
  } catch (error) {
    console.error('获取自动更新资源列表失败:', error)
    return error instanceof Error
      ? error.message
      : '获取自动更新资源列表时发生未知错误'
  }
}
