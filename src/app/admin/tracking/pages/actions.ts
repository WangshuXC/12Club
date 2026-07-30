'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildRawDateRangeFilter,
  getTrackingDateRange,
  calcSkip,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'
import { Prisma } from '@prisma/client'

import type {
  TrackingPageStatsItem,
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'

export type PageStats = TrackingPageStatsItem

export type PaginationInfo = TrackingPaginationInfo

type PageStatsRow = TrackingPageStatsItem & { total: number }

type PageVisitorActivityRow = {
  visitor_id: number
  visit_count: number
  total: number
}

const normalizedPagePath = (column: string) =>
  Prisma.raw(
    `COALESCE(NULLIF(split_part(split_part(regexp_replace(${column}, '^[a-z][a-z0-9+.-]*://[^/]+', '', 'i'), '#', 1), '?', 1), ''), '/')`
  )

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

    const { start, end } = getTrackingDateRange(startDate, endDate)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )
    const skip = calcSkip(page, pageSize)

    // Page paths, titles and visitor counts are grouped in PostgreSQL. This
    // avoids transferring every page_view event for a long reporting period.
    const pageVisitorStats = await prisma.$queryRaw<PageStatsRow[]>(Prisma.sql`
      WITH page_events AS (
        SELECT
          ${normalizedPagePath('e."page_url"')} AS "page_url",
          e."page_title",
          e."visitor_id",
          e."timestamp"
        FROM "tracking_event" e
        WHERE ${eventRange}
          AND e."event_type" = 'custom'
          AND e."event_name" = 'page_view'
      ),
      page_stats AS (
        SELECT
          "page_url",
          COUNT(*)::int AS "total_views",
          COUNT(DISTINCT "visitor_id")::int AS "unique_visitors"
        FROM page_events
        GROUP BY "page_url"
      ),
      latest_titles AS (
        SELECT DISTINCT ON ("page_url") "page_url", "page_title"
        FROM page_events
        WHERE "page_title" <> ''
        ORDER BY "page_url", "timestamp" DESC
      )
      SELECT
        stats."page_url",
        COALESCE(titles."page_title", '未知页面') AS "page_title",
        stats."total_views",
        stats."unique_visitors",
        (COUNT(*) OVER())::int AS "total"
      FROM page_stats stats
      LEFT JOIN latest_titles titles ON titles."page_url" = stats."page_url"
      ORDER BY stats."total_views" DESC, stats."page_url" ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `)
    const total = pageVisitorStats[0]?.total || 0

    return {
      list: pageVisitorStats.map(({ total: _total, ...item }) => item),
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
    const { start, end } = getTrackingDateRange(startDate, endDate)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )

    const paginatedVisitorEvents = await prisma.$queryRaw<
      PageVisitorActivityRow[]
    >(Prisma.sql`
        WITH visitor_activity AS (
          SELECT
            e."visitor_id",
            COUNT(*)::int AS "visit_count"
          FROM "tracking_event" e
          WHERE ${eventRange}
            AND e."event_type" = 'custom'
            AND e."event_name" = 'page_view'
            AND ${normalizedPagePath('e."page_url"')} = ${pageUrl}
          GROUP BY e."visitor_id"
        )
        SELECT
          "visitor_id",
          "visit_count",
          (COUNT(*) OVER())::int AS "total"
        FROM visitor_activity
        ORDER BY "visit_count" DESC, "visitor_id" ASC
        LIMIT ${pageSize} OFFSET ${skip}
      `)
    const total = paginatedVisitorEvents[0]?.total || 0
    const visitorIds = paginatedVisitorEvents.map((event) => event.visitor_id)

    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })

    const visitorMap = new Map(visitors.map((v) => [v.id, v]))
    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    const result: PageVisitor[] = paginatedVisitorEvents.flatMap((activity) => {
      const visitor = visitorMap.get(activity.visitor_id)
      if (!visitor) return []

      return [
        {
          id: visitor.id,
          guid: visitor.guid,
          user_id: visitor.user_id,
          user_agent: visitor.user_agent,
          ip: visitor.ip,
          first_seen: visitor.first_seen.toISOString(),
          last_seen: visitor.last_seen.toISOString(),
          visit_count: activity.visit_count,
          user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
        }
      ]
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
