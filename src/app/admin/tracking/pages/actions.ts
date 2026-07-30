'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildEventDateFilter,
  calcSkip,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds,
  normalizeTrackingPath
} from '@/utils/trackingUtils'

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

    const dateFilter = buildEventDateFilter(startDate, endDate)

    // 使用 page_view 自定义事件统计真实页面访问
    const pageViewFilter = {
      ...dateFilter,
      event_type: 'custom',
      event_name: 'page_view'
    }

    const pageViews = await prisma.trackingEvent.findMany({
      where: pageViewFilter,
      select: {
        page_url: true,
        page_title: true,
        visitor_id: true,
        timestamp: true
      }
    })

    const pageStatsMap = new Map<
      string,
      {
        page_url: string
        page_title: string
        latestTimestamp: number
        total_views: number
        visitors: Set<number>
      }
    >()

    pageViews.forEach((event) => {
      const pageUrl = normalizeTrackingPath(event.page_url)
      const stat = pageStatsMap.get(pageUrl)

      if (stat) {
        stat.total_views++
        stat.visitors.add(event.visitor_id)
        if (
          event.timestamp.getTime() > stat.latestTimestamp &&
          event.page_title
        ) {
          stat.page_title = event.page_title
          stat.latestTimestamp = event.timestamp.getTime()
        }
        return
      }

      pageStatsMap.set(pageUrl, {
        page_url: pageUrl,
        page_title: event.page_title || '未知页面',
        latestTimestamp: event.timestamp.getTime(),
        total_views: 1,
        visitors: new Set([event.visitor_id])
      })
    })

    const pageStats = Array.from(pageStatsMap.values())
      .map(({ visitors, latestTimestamp: _latestTimestamp, ...item }) => ({
        ...item,
        unique_visitors: visitors.size
      }))
      .sort((a, b) => b.total_views - a.total_views)
    const total = pageStats.length
    const pageVisitorStats = pageStats.slice(
      calcSkip(page, pageSize),
      calcSkip(page, pageSize) + pageSize
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

    const visitorEvents = await prisma.trackingEvent.findMany({
      where: {
        ...dateFilter,
        page_url: { not: '' },
        event_type: 'custom',
        event_name: 'page_view'
      },
      select: { visitor_id: true, page_url: true, timestamp: true }
    })

    const visitorActivity = new Map<
      number,
      { count: number; firstActive: Date; lastActive: Date }
    >()
    visitorEvents.forEach((event) => {
      if (normalizeTrackingPath(event.page_url) !== pageUrl) return
      const activity = visitorActivity.get(event.visitor_id)

      if (activity) {
        activity.count++
        if (event.timestamp < activity.firstActive) {
          activity.firstActive = event.timestamp
        }
        if (event.timestamp > activity.lastActive) {
          activity.lastActive = event.timestamp
        }
        return
      }

      visitorActivity.set(event.visitor_id, {
        count: 1,
        firstActive: event.timestamp,
        lastActive: event.timestamp
      })
    })

    const sortedVisitorEvents = Array.from(visitorActivity.entries()).sort(
      ([, a], [, b]) => b.count - a.count
    )
    const total = sortedVisitorEvents.length
    const paginatedVisitorEvents = sortedVisitorEvents.slice(
      skip,
      skip + pageSize
    )
    const visitorIds = paginatedVisitorEvents.map(([visitorId]) => visitorId)

    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })

    const visitorMap = new Map(visitors.map((v) => [v.id, v]))
    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    const result: PageVisitor[] = paginatedVisitorEvents.map(
      ([visitorId, activity]) => {
        const visitor = visitorMap.get(visitorId)!

        return {
          id: visitor.id,
          guid: visitor.guid,
          user_id: visitor.user_id,
          user_agent: visitor.user_agent,
          ip: visitor.ip,
          first_seen: visitor.first_seen.toISOString(),
          last_seen: visitor.last_seen.toISOString(),
          visit_count: activity.count,
          user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
        }
      }
    )

    return {
      list: result,
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch page visitors:', error)
    return null
  }
}
