'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildRawDateRangeFilter,
  getTrackingDateRange,
  calcSkip,
  buildPagination,
  fetchUserMapByIds
} from '@/utils/trackingUtils'
import { Prisma } from '@prisma/client'

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
  visitor_ids: number[]
  user_agents: string[]
  ips: string[]
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

export type VisitorSortBy =
  | 'user'
  | 'first_active'
  | 'last_active'
  | 'events_count'
export type VisitorSortDirection = 'ascending' | 'descending'

type VisitorStatsRow = {
  id: number
  guid: string
  user_id: number | null
  visitor_ids: number[]
  user_agents: string[]
  ips: string[]
  first_seen: Date
  last_seen: Date
  first_active: Date
  last_active: Date
  events_count: number
  total: number
}

// 获取访客统计
export async function getVisitorStats(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 20,
  sortBy: VisitorSortBy = 'last_active',
  sortDirection: VisitorSortDirection = 'descending'
): Promise<TrackingPaginationResult<VisitorStats> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const { start, end } = getTrackingDateRange(startDate, endDate)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )
    const safeSortBy: VisitorSortBy = [
      'user',
      'first_active',
      'last_active',
      'events_count'
    ].includes(sortBy)
      ? sortBy
      : 'last_active'
    const sortExpression = {
      user: Prisma.raw('COALESCE("sort_name", "guid")'),
      first_active: Prisma.raw('"first_active"'),
      last_active: Prisma.raw('"last_active"'),
      events_count: Prisma.raw('"events_count"')
    }[safeSortBy]
    const sortDirectionSql = Prisma.raw(
      sortDirection === 'ascending' ? 'ASC' : 'DESC'
    )
    const skip = calcSkip(page, pageSize)
    // First aggregate raw activity by browser visitor, then roll those rows up
    // to a user ID in the database. Only one paginated group per user crosses
    // the network boundary, even when a user has many devices.
    const visitorRows = await prisma.$queryRaw<VisitorStatsRow[]>(Prisma.sql`
      WITH activity AS (
        SELECT
          e."visitor_id",
          COUNT(*)::int AS "events_count",
          MIN(e."timestamp") AS "first_active",
          MAX(e."timestamp") AS "last_active"
        FROM "tracking_event" e
        WHERE ${eventRange}
        GROUP BY e."visitor_id"
      ),
      grouped AS (
        SELECT
          MIN(v."id")::int AS "id",
          (ARRAY_AGG(v."guid" ORDER BY v."id"))[1] AS "guid",
          v."user_id",
          ARRAY_AGG(v."id" ORDER BY v."id") AS "visitor_ids",
          ARRAY_AGG(DISTINCT v."user_agent") AS "user_agents",
          COALESCE(
            ARRAY_AGG(DISTINCT v."ip") FILTER (WHERE v."ip" <> ''),
            ARRAY[]::varchar[]
          ) AS "ips",
          MIN(v."first_seen") AS "first_seen",
          MAX(v."last_seen") AS "last_seen",
          MIN(activity."first_active") AS "first_active",
          MAX(activity."last_active") AS "last_active",
          SUM(activity."events_count")::int AS "events_count",
          COALESCE(MAX(u."name"), (ARRAY_AGG(v."guid" ORDER BY v."id"))[1]) AS "sort_name"
        FROM activity
        INNER JOIN "tracking_visitor" v ON v."id" = activity."visitor_id"
        LEFT JOIN "user" u ON u."id" = v."user_id"
        GROUP BY v."user_id", COALESCE(v."user_id", -v."id")
      )
      SELECT
        "id",
        "guid",
        "user_id",
        "visitor_ids",
        "user_agents",
        "ips",
        "first_seen",
        "last_seen",
        "first_active",
        "last_active",
        "events_count",
        (COUNT(*) OVER())::int AS "total"
      FROM grouped
      ORDER BY ${sortExpression} ${sortDirectionSql}, "id" ASC
      LIMIT ${pageSize} OFFSET ${skip}
    `)
    const total = visitorRows[0]?.total || 0
    const userMap = await fetchUserMapByIds(
      visitorRows
        .map((visitor) => visitor.user_id)
        .filter((id): id is number => id !== null)
    )

    return {
      list: visitorRows.map((visitor) => ({
        id: visitor.id,
        guid: visitor.guid,
        user_id: visitor.user_id,
        visitor_ids: visitor.visitor_ids,
        user_agents: visitor.user_agents,
        ips: visitor.ips,
        first_seen: visitor.first_seen.toISOString(),
        last_seen: visitor.last_seen.toISOString(),
        first_active: visitor.first_active.toISOString(),
        last_active: visitor.last_active.toISOString(),
        events_count: visitor.events_count,
        user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
      })),
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch visitor stats:', error)
    return null
  }
}
