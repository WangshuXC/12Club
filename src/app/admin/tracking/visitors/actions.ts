'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildEventDateFilter,
  calcSkip,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'

import type {
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'

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
  first_active: string
  last_active: string
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
    const dateFilter = buildEventDateFilter(startDate, endDate)

    // The list is based on activity in the selected period, not when a visitor
    // was first created. Counts and timestamps therefore share one definition.
    const activeVisitors = await prisma.trackingEvent.groupBy({
      by: ['visitor_id'],
      where: dateFilter,
      _count: { id: true },
      _min: { timestamp: true },
      _max: { timestamp: true },
      orderBy: { _max: { timestamp: 'desc' } }
    })
    const total = activeVisitors.length
    const pageVisitors = activeVisitors.slice(skip, skip + pageSize)
    const visitorIds = pageVisitors.map((visitor) => visitor.visitor_id)
    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })
    const visitorMap = new Map(visitors.map((visitor) => [visitor.id, visitor]))

    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    return {
      list: pageVisitors.flatMap((activity) => {
        const visitor = visitorMap.get(activity.visitor_id)
        if (!visitor || !activity._min.timestamp || !activity._max.timestamp) {
          return []
        }

        return [
          {
            id: visitor.id,
            guid: visitor.guid,
            user_id: visitor.user_id,
            user_agent: visitor.user_agent,
            ip: visitor.ip,
            first_seen: visitor.first_seen.toISOString(),
            last_seen: visitor.last_seen.toISOString(),
            first_active: activity._min.timestamp.toISOString(),
            last_active: activity._max.timestamp.toISOString(),
            events_count: activity._count.id,
            user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
          }
        ]
      }),
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch visitor stats:', error)
    return null
  }
}
