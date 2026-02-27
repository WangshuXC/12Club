'use server'

import {
  verifyAdminAccess,
  buildVisitorDateFilter,
  calcSkip,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'

import { prisma } from '../../../../../prisma'

import type {
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'
import type { Prisma } from '@prisma/client'

// 定义带有事件计数的访客类型
type VisitorWithEventsCount = Prisma.TrackingVisitorGetPayload<{
  include: { _count: { select: { events: true } } }
}>

export type PaginationInfo = TrackingPaginationInfo

// 重新定义完整的 VisitorStats 类型（序列化后日期为 string）
export type VisitorStats = {
  id: number
  guid: string
  user_id: number | null
  user_agent: string
  ip: string
  first_seen: string
  last_seen: string
  events_count: number
  user: {
    id: number
    name: string
    avatar: string
    email: string
  } | null
}

// 获取访客统计
export async function getVisitorStats(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<TrackingPaginationResult<VisitorStats> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const skip = calcSkip(page, pageSize)
    const visitorDateFilter = buildVisitorDateFilter(startDate, endDate)

    const [visitors, total] = await Promise.all([
      prisma.trackingVisitor.findMany({
        where: visitorDateFilter,
        orderBy: { last_seen: 'desc' },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { events: true }
          }
        }
      }),
      prisma.trackingVisitor.count({
        where: visitorDateFilter
      })
    ])

    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    return {
      list: visitors.map((v: VisitorWithEventsCount) => ({
        id: v.id,
        guid: v.guid,
        user_id: v.user_id,
        user_agent: v.user_agent,
        ip: v.ip,
        first_seen: v.first_seen.toISOString(),
        last_seen: v.last_seen.toISOString(),
        events_count: v._count.events,
        user: v.user_id ? userMap.get(v.user_id) || null : null
      })),
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch visitor stats:', error)
    return null
  }
}
