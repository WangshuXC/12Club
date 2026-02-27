'use server'

import {
  verifyAdminAccess,
  buildEventDateFilter,
  calcSkip,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'

import { prisma } from '../../../../../prisma'

import type {
  TrackingPageStatsItem,
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'

export type PageStats = TrackingPageStatsItem

export type PaginationInfo = TrackingPaginationInfo

// 页面访客信息类型
export type PageVisitor = {
  id: number
  guid: string
  user_id: number | null
  user_agent: string | null
  ip: string | null
  first_seen: string
  last_seen: string
  visit_count: number
  user: {
    id: number
    name: string
    avatar: string
    email: string
  } | null
}

// 获取页面访问统计
export async function getPageStats(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<TrackingPaginationResult<PageStats> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const skip = calcSkip(page, pageSize)
    const dateFilter = buildEventDateFilter(startDate, endDate)

    const pageStatsResult = await prisma.trackingEvent.groupBy({
      by: ['page_url', 'page_title'],
      where: {
        ...dateFilter,
        event_type: 'expose'
      },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    })

    const total = pageStatsResult.length
    const paginatedStats = pageStatsResult.slice(skip, skip + pageSize)

    const pageVisitorStats = await Promise.all(
      paginatedStats.map(async (stat) => {
        const uniqueVisitors = await prisma.trackingEvent.groupBy({
          by: ['visitor_id'],
          where: {
            ...dateFilter,
            page_url: stat.page_url,
            event_type: 'expose'
          }
        })

        return {
          page_url: stat.page_url,
          page_title: stat.page_title || '未知页面',
          total_views: stat._count.id,
          unique_visitors: uniqueVisitors.length
        }
      })
    )

    return {
      list: pageVisitorStats,
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch page stats:', error)
    return null
  }
}

// 获取指定页面的访客列表
export async function getPageVisitors(
  pageUrl: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<TrackingPaginationResult<PageVisitor> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const skip = calcSkip(page, pageSize)
    const dateFilter = buildEventDateFilter(startDate, endDate)

    const visitorEvents = await prisma.trackingEvent.groupBy({
      by: ['visitor_id'],
      where: {
        ...dateFilter,
        page_url: pageUrl,
        event_type: 'expose'
      },
      _count: { id: true },
      orderBy: {
        _count: { id: 'desc' }
      }
    })

    const total = visitorEvents.length
    const paginatedVisitorEvents = visitorEvents.slice(skip, skip + pageSize)
    const visitorIds = paginatedVisitorEvents.map((v) => v.visitor_id)

    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })

    const visitorMap = new Map(visitors.map((v) => [v.id, v]))
    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    const visitCountMap = new Map(
      paginatedVisitorEvents.map((v) => [v.visitor_id, v._count.id])
    )

    const result: PageVisitor[] = paginatedVisitorEvents.map((ve) => {
      const visitor = visitorMap.get(ve.visitor_id)!

      return {
        id: visitor.id,
        guid: visitor.guid,
        user_id: visitor.user_id,
        user_agent: visitor.user_agent,
        ip: visitor.ip,
        first_seen: visitor.first_seen.toISOString(),
        last_seen: visitor.last_seen.toISOString(),
        visit_count: visitCountMap.get(ve.visitor_id) || 0,
        user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
      }
    })

    return {
      list: result,
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch page visitors:', error)
    return null
  }
}
