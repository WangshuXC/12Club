import { z } from 'zod'
import { prisma } from '../../../../../prisma'
import { adminGetResourceSchema } from '@/validations/admin'
import type { AdminResource } from '@/types/api/admin'

export const getResource = async (
  input: z.infer<typeof adminGetResourceSchema>,
) => {
  const { page, limit, search, sortField, sortOrder, types } = input
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
          db_id: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          aliases: {
            some: {
              name: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          }
        }
      ]
    })
  }

  // 添加类型过滤条件
  if (types && types.length > 0) {
    whereConditions.push({
      OR: types.map(type => ({
        db_id: {
          startsWith: type
        }
      }))
    })
  }

  // 构建最终的 where 条件
  const where = whereConditions.length > 0
    ? whereConditions.length === 1
      ? whereConditions[0]
      : { AND: whereConditions }
    : {}

  // 构建排序条件
  let orderBy: any = {}

  // 处理关联计数排序
  if (sortField === 'favorite_by') {
    orderBy = {
      favorite_folders: {
        _count: sortOrder
      }
    }
  } else {
    // 普通字段排序
    orderBy[sortField] = sortOrder
  }

  try {
    const [data, total] = await Promise.all([
      prisma.resource.findMany({
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
          aliases: {
            select: {
              id: true,
              name: true
            }
          },
          favorite_folders: {
            select: {
              id: true,
            }
          },
          tag_relations: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.resource.count({ where })
    ])

    const resources: AdminResource[] = data.map((resource) => ({
      id: resource.id,
      dbId: resource.db_id,
      name: resource.name,
      banner: resource.image_url,
      author: resource.author,
      translator: resource.translator,
      user: resource.user,
      created: resource.created,
      introduction: resource.introduction,
      released: resource.released,
      accordionTotal: resource.accordion_total,
      language: Array.isArray(resource.language) && resource.language.length > 0
        ? resource.language[0]
        : 'other', // 安全地取第一个语言作为主语言
      type: resource.type,
      status: resource.status,
      download: resource.download,
      view: resource.view,
      comment: resource.comment,
      favorite_by: resource.favorite_folders.length,
      aliases: resource.aliases?.map(alias => alias.name) || [], // 转换为字符串数组
      tags: resource.tag_relations?.map(relation => relation.tag.name) || [] // 转换为字符串数组
    }))

    return { resources, total }
  } catch (error) {
    console.error('获取资源列表失败:', error)
    return error instanceof Error ? error.message : '获取资源列表时发生未知错误'
  }
} 