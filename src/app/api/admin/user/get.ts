import { z } from 'zod'

import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import type { AdminUser } from '@/types/api/admin'

export const getUserInfo = async (
  input: z.infer<typeof adminPaginationSchema>
) => {
  const { page, limit, search, sortField, sortOrder } = input
  const offset = (page - 1) * limit

  try {
    // 构建查询条件 - 支持搜索用户名或邮箱
    const whereCondition = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } }
        ]
      }
      : {}

    // 获取用户数据
    const [usersData, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        orderBy: sortField && sortOrder && sortField === 'created'
          ? [{ role: 'desc' }, { created: sortOrder }]
          : [{ role: 'desc' }, { created: 'desc' }],
        include: {
          _count: {
            select: {
              resource_patches: true,
              resources: true
            }
          }
        }
      }),
      prisma.user.count({
        where: whereCondition
      })
    ])

    // 如果需要对资源数量排序，在内存中排序（保持role降序为第一优先级）
    let sortedUsers = usersData
    if (sortField && sortOrder && (sortField === 'resource' || sortField === 'resource_patch')) {
      sortedUsers = usersData.sort((a, b) => {
        // 首先按role降序排序
        if (a.role !== b.role) {
          return b.role - a.role
        }

        // 然后按指定字段排序
        const aCount = sortField === 'resource' ? a._count.resources : a._count.resource_patches
        const bCount = sortField === 'resource' ? b._count.resources : b._count.resource_patches

        if (sortOrder === 'asc') {
          return aCount - bCount
        } else {
          return bCount - aCount
        }
      })
    }

    // 数据格式转换
    const users: AdminUser[] = sortedUsers.map((user) => ({
      id: user.id,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      email: user.email,
      created: user.created.toISOString(),
      status: user.status,
      _count: {
        resource_patch: user._count.resource_patches,
        resource: user._count.resources
      }
    }))

    return { users, total }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}
