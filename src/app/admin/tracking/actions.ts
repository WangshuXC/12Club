'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildRawDateRangeFilter,
  generateDateRange,
  generateHourRange
} from '@/utils/trackingUtils'
import { parseUserAgentLabel } from '@/utils/device'
import { Prisma } from '@prisma/client'

import type {
  TrackingOverviewResult,
  TrackingSummary
} from '@/types/api/tracking'

// 重新导出类型供组件使用
export type TrackingOverview = TrackingOverviewResult

// 趋势数据类型
export type TrendDataPoint = {
  date: string
  value: number
}

export type TrendType =
  | 'visitors'
  | 'newVisitors'
  | 'events'
  | 'pageViews'
  | 'pages'
  | 'plays'

export type TrendGranularity = 'hour' | 'day'

type DateRange = { start: Date; end: Date }

type SummaryEventRow = {
  total_events: number
  active_visitors: number
  page_views: number
  anime_play_count: number
  play_visitors: number
  sessions: number
}

type DeviceStatRow = {
  user_agent: string
  count: number
}

type SourceStatRow = {
  source: string
  count: number
}

type CountRow = { count: number }
type TrendRow = { date: string; value: number }

// TrackingEvent uses Prisma's default PostgreSQL timestamp mapping (UTC value
// stored without an offset). The dashboard uses China Standard Time for slots.
const shanghaiBucket = (column: string, granularity: TrendGranularity) =>
  Prisma.raw(
    granularity === 'hour'
      ? `TO_CHAR((${column} AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD"T"HH24:00')`
      : `TO_CHAR((${column} AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')`
  )

const normalizedPagePath = (column: string) =>
  Prisma.raw(
    `COALESCE(NULLIF(split_part(split_part(regexp_replace(${column}, '^[a-z][a-z0-9+.-]*://[^/]+', '', 'i'), '#', 1), '?', 1), ''), '/')`
  )

const getPreviousRange = ({ start, end }: DateRange): DateRange => {
  const duration = end.getTime() - start.getTime()

  return {
    start: new Date(start.getTime() - duration),
    end: start
  }
}

const getRange = (startDate?: string, endDate?: string): DateRange => {
  const end = endDate ? new Date(endDate) : new Date()
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

  return { start, end }
}

const getSummary = async (
  start: Date,
  end: Date
): Promise<{ summary: TrackingSummary; totalEvents: number }> => {
  const eventRange = buildRawDateRangeFilter(
    Prisma.raw('"timestamp"'),
    start,
    end
  )

  const [eventRows, newVisitors] = await Promise.all([
    prisma.$queryRaw<SummaryEventRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::int AS "total_events",
        COUNT(DISTINCT "visitor_id") FILTER (
          WHERE "event_type" = 'custom' AND "event_name" = 'page_view'
        )::int AS "active_visitors",
        COUNT(*) FILTER (
          WHERE "event_type" = 'custom' AND "event_name" = 'page_view'
        )::int AS "page_views",
        COUNT(*) FILTER (
          WHERE "event_type" = 'custom' AND "event_name" = 'accordion-play'
        )::int AS "anime_play_count",
        COUNT(DISTINCT "visitor_id") FILTER (
          WHERE "event_type" = 'custom' AND "event_name" = 'accordion-play'
        )::int AS "play_visitors",
        COUNT(DISTINCT "session_id") FILTER (
          WHERE "event_type" = 'custom'
            AND "event_name" = 'page_view'
            AND "session_id" <> ''
        )::int AS "sessions"
      FROM "tracking_event"
      WHERE ${eventRange}
    `),
    prisma.trackingVisitor.count({
      where: { first_seen: { gte: start, lt: end } }
    })
  ])
  const eventStats = eventRows[0] || {
    total_events: 0,
    active_visitors: 0,
    page_views: 0,
    anime_play_count: 0,
    play_visitors: 0,
    sessions: 0
  }

  return {
    summary: {
      activeVisitors: eventStats.active_visitors,
      newVisitors,
      pageViews: eventStats.page_views,
      animePlayCount: eventStats.anime_play_count,
      playVisitors: eventStats.play_visitors,
      sessions: eventStats.sessions
    },
    totalEvents: eventStats.total_events
  }
}

// 获取概览统计
export async function getTrackingOverview(
  startDate?: string,
  endDate?: string
): Promise<TrackingOverview | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const range = getRange(startDate, endDate)
    const previousRange = getPreviousRange(range)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      range.start,
      range.end
    )
    const [
      summaryResult,
      previousSummaryResult,
      uniquePageRows,
      deviceRows,
      eventTypeStats,
      sourceRows
    ] = await Promise.all([
      getSummary(range.start, range.end),
      getSummary(previousRange.start, previousRange.end),
      prisma.$queryRaw<CountRow[]>(Prisma.sql`
        SELECT COUNT(DISTINCT ${normalizedPagePath('e."page_url"')})::int AS "count"
        FROM "tracking_event" e
        WHERE ${eventRange}
          AND e."event_type" = 'custom'
          AND e."event_name" = 'page_view'
      `),
      prisma.$queryRaw<DeviceStatRow[]>(Prisma.sql`
        SELECT
          COALESCE(v."user_agent", '') AS "user_agent",
          COUNT(*)::int AS "count"
        FROM "tracking_event" e
        INNER JOIN "tracking_visitor" v ON v."id" = e."visitor_id"
        WHERE ${eventRange}
          AND e."event_type" = 'custom'
          AND e."event_name" = 'page_view'
        GROUP BY v."user_agent"
      `),
      prisma.trackingEvent.groupBy({
        by: ['event_name'],
        where: { timestamp: { gte: range.start, lt: range.end } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6
      }),
      prisma.$queryRaw<SourceStatRow[]>(Prisma.sql`
        SELECT
          CASE
            WHEN e."referrer" = '' THEN '直接访问'
            WHEN REGEXP_REPLACE(
              LOWER(
                SUBSTRING(
                  e."referrer" FROM '^[a-z][a-z0-9+.-]*://([^/:?#]+)'
                )
              ),
              '^www\\.',
              ''
            ) = 'feishu.nankai.edu.cn' THEN '飞书微应用'
            WHEN SUBSTRING(
              e."referrer" FROM '^[a-z][a-z0-9+.-]*://([^/:?#]+)'
            ) IS NOT NULL THEN REGEXP_REPLACE(
              LOWER(
                SUBSTRING(
                  e."referrer" FROM '^[a-z][a-z0-9+.-]*://([^/:?#]+)'
                )
              ),
              '^www\\.',
              ''
            )
            ELSE '未知来源'
          END AS "source",
          COUNT(*)::int AS "count"
        FROM "tracking_event" e
        WHERE ${eventRange}
          AND e."event_type" = 'custom'
          AND e."event_name" = 'page_view'
        GROUP BY 1
        ORDER BY "count" DESC
        LIMIT 6
      `)
    ])

    const summary = summaryResult.summary
    const previousSummary = previousSummaryResult.summary

    const deviceMap = new Map<string, number>()
    deviceRows.forEach((row) => {
      const device = parseUserAgentLabel(row.user_agent)
      deviceMap.set(device, (deviceMap.get(device) || 0) + row.count)
    })

    return {
      summary,
      previousSummary,
      totalEvents: summaryResult.totalEvents,
      uniquePages: uniquePageRows[0]?.count || 0,
      deviceStats: Array.from(deviceMap, ([device, count]) => ({
        device,
        count
      })).sort((a, b) => b.count - a.count),
      eventTypeStats: eventTypeStats.map((e) => ({
        type: e.event_name,
        count: e._count.id
      })),
      sourceStats: sourceRows.map((row) => ({
        source: row.source,
        count: row.count
      }))
    }
  } catch (error) {
    console.error('Failed to fetch tracking overview:', error)
    return null
  }
}

// 获取趋势数据
export async function getTrendData(
  type: TrendType,
  startDate?: string,
  endDate?: string,
  granularity: TrendGranularity = 'day'
): Promise<TrendDataPoint[] | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const { start, end } = getRange(startDate, endDate)

    const isHourly = granularity === 'hour'
    const slotEnd = new Date(end.getTime() - 1)
    const slots = isHourly
      ? generateHourRange(start, slotEnd)
      : generateDateRange(start, slotEnd)
    const bucket = shanghaiBucket('e."timestamp"', granularity)
    const eventRange = buildRawDateRangeFilter(
      Prisma.raw('e."timestamp"'),
      start,
      end
    )
    const pageViewFilter = Prisma.sql`
      AND e."event_type" = 'custom' AND e."event_name" = 'page_view'
    `
    const playFilter = Prisma.sql`
      AND e."event_type" = 'custom' AND e."event_name" = 'accordion-play'
    `

    let rows: TrendRow[]

    if (type === 'newVisitors') {
      const visitorBucket = shanghaiBucket('v."first_seen"', granularity)
      const visitorRange = buildRawDateRangeFilter(
        Prisma.raw('v."first_seen"'),
        start,
        end
      )

      rows = await prisma.$queryRaw<TrendRow[]>(Prisma.sql`
        SELECT ${visitorBucket} AS "date", COUNT(*)::int AS "value"
        FROM "tracking_visitor" v
        WHERE ${visitorRange}
        GROUP BY 1
      `)
    } else {
      const value =
        type === 'visitors'
          ? Prisma.raw('COUNT(DISTINCT e."visitor_id")::int')
          : type === 'pages'
            ? Prisma.sql`COUNT(DISTINCT ${normalizedPagePath('e."page_url"')})::int`
            : Prisma.raw('COUNT(*)::int')
      const eventFilter =
        type === 'visitors' || type === 'pageViews' || type === 'pages'
          ? pageViewFilter
          : type === 'plays'
            ? playFilter
            : Prisma.empty

      rows = await prisma.$queryRaw<TrendRow[]>(Prisma.sql`
        SELECT ${bucket} AS "date", ${value} AS "value"
        FROM "tracking_event" e
        WHERE ${eventRange}${eventFilter}
        GROUP BY 1
      `)
    }

    const valueMap = new Map(rows.map((row) => [row.date, Number(row.value)]))

    return slots.map((slot) => ({
      date: slot,
      value: valueMap.get(slot) || 0
    }))
  } catch (error) {
    console.error('Failed to fetch trend data:', error)
    return null
  }
}
