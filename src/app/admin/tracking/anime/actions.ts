'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildRawDateRangeFilter,
  getTrackingDateRange,
  buildPagination,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'
import { Prisma } from '@prisma/client'

import type {
  TrackingAnimeStatsItem,
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'
export type AnimeStats = TrackingAnimeStatsItem

export type PaginationInfo = TrackingPaginationInfo
export type AnimeSortBy = 'name' | 'playCount' | 'uniqueVisitors' | 'episodes'
export type SortDirection = 'ascending' | 'descending'

type AnimeStatsRow = {
  dbid: string
  name: string | null
  banner: string | null
  status: number | null
  play_count: number
  unique_visitors: number
  accordion_stats: unknown
  total: number
}

type AnimeVisitorActivityRow = {
  visitor_id: number
  visit_count: number
  total: number
}

const parseAccordionStats = (
  value: unknown
): TrackingAnimeStatsItem['accordionStats'] => {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []

    const record = item as Record<string, unknown>
    const accordion = record['accordion']
    const playCount = record['playCount']
    if (typeof accordion !== 'string' || typeof playCount !== 'number') {
      return []
    }

    return [{ accordion, playCount }]
  })
}

// 动漫访客信息类型
export type AnimeVisitor = {
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

// 获取动漫播放统计
export async function getAnimeStats(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20,
  sortBy: AnimeSortBy = 'playCount',
  sortDirection: SortDirection = 'descending'
): Promise<TrackingPaginationResult<AnimeStats> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const { start, end } = getTrackingDateRange(startDate, endDate)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )
    const safeSortBy: AnimeSortBy = [
      'name',
      'playCount',
      'uniqueVisitors',
      'episodes'
    ].includes(sortBy)
      ? sortBy
      : 'playCount'
    const sortExpression = {
      name: Prisma.raw('COALESCE(r."name", \'未知动漫\')'),
      playCount: Prisma.raw('stats."play_count"'),
      uniqueVisitors: Prisma.raw('stats."unique_visitors"'),
      episodes: Prisma.raw('stats."episode_count"')
    }[safeSortBy]
    const sortDirectionSql = Prisma.raw(
      sortDirection === 'ascending' ? 'ASC' : 'DESC'
    )
    const skip = (page - 1) * pageSize

    // JSON payloads are extracted and aggregated by PostgreSQL, so the server
    // only receives the requested resource page rather than every play event.
    const animeStatsRows = await prisma.$queryRaw<AnimeStatsRow[]>(Prisma.sql`
      WITH filtered_events AS (
        SELECT
          e."extra_data" ->> 'dbid' AS "dbid",
          COALESCE(NULLIF(e."extra_data" ->> 'accordion', ''), '1') AS "accordion",
          e."visitor_id"
        FROM "tracking_event" e
        WHERE ${eventRange}
          AND e."event_type" = 'custom'
          AND e."event_name" = 'accordion-play'
      ),
      episode_counts AS (
        SELECT "dbid", "accordion", COUNT(*)::int AS "play_count"
        FROM filtered_events
        WHERE "dbid" IS NOT NULL AND "dbid" <> ''
        GROUP BY "dbid", "accordion"
      ),
      stats AS (
        SELECT
          "dbid",
          COUNT(*)::int AS "play_count",
          COUNT(DISTINCT "visitor_id")::int AS "unique_visitors",
          COUNT(DISTINCT "accordion")::int AS "episode_count"
        FROM filtered_events
        WHERE "dbid" IS NOT NULL AND "dbid" <> ''
        GROUP BY "dbid"
      ),
      accordion_stats AS (
        SELECT
          "dbid",
          JSONB_AGG(
            JSONB_BUILD_OBJECT(
              'accordion', "accordion",
              'playCount', "play_count"
            )
            ORDER BY
              CASE
                WHEN "accordion" ~ '^[0-9]+$' THEN "accordion"::int
                ELSE 2147483647
              END,
              "accordion"
          ) AS "accordion_stats"
        FROM episode_counts
        GROUP BY "dbid"
      )
      SELECT
        stats."dbid",
        r."name",
        r."image_url" AS "banner",
        r."status",
        stats."play_count",
        stats."unique_visitors",
        accordion_stats."accordion_stats",
        (COUNT(*) OVER())::int AS "total"
      FROM stats
      LEFT JOIN "resource" r ON r."db_id" = stats."dbid"
      LEFT JOIN accordion_stats ON accordion_stats."dbid" = stats."dbid"
      ORDER BY ${sortExpression} ${sortDirectionSql}, stats."dbid" ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `)
    const total = animeStatsRows[0]?.total || 0
    const list: AnimeStats[] = animeStatsRows.map((row) => ({
      dbid: row.dbid,
      name: row.name || '未知动漫',
      banner: row.banner || '',
      status: row.status || 0,
      playCount: row.play_count,
      uniqueVisitors: row.unique_visitors,
      accordionStats: parseAccordionStats(row.accordion_stats)
    }))

    return {
      list,
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch anime stats:', error)
    return null
  }
}

// 获取指定动漫的访客列表
export async function getAnimeVisitors(
  dbid: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20
): Promise<TrackingPaginationResult<AnimeVisitor> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const { start, end } = getTrackingDateRange(startDate, endDate)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )
    const skip = (page - 1) * pageSize
    const paginatedVisitors = await prisma.$queryRaw<
      AnimeVisitorActivityRow[]
    >(Prisma.sql`
        WITH visitor_activity AS (
          SELECT e."visitor_id", COUNT(*)::int AS "visit_count"
          FROM "tracking_event" e
          WHERE ${eventRange}
            AND e."event_type" = 'custom'
            AND e."event_name" = 'accordion-play'
            AND e."extra_data" ->> 'dbid' = ${dbid}
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
    const total = paginatedVisitors[0]?.total || 0
    const visitorIds = paginatedVisitors.map((visitor) => visitor.visitor_id)

    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })

    const visitorMap = new Map(visitors.map((v) => [v.id, v]))
    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    const result: AnimeVisitor[] = paginatedVisitors.flatMap((activity) => {
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
    console.error('Failed to fetch anime visitors:', error)
    return null
  }
}
