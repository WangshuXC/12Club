'use server'

import { prisma } from '@/lib/prisma'
import {
  verifyAdminAccess,
  buildEventDateFilter,
  buildVisitorDateFilter,
  generateDateRange,
  generateHourRange,
  aggregateByDate,
  aggregateByHour,
  mapToTrendPoints,
  normalizeTrackingPath
} from '@/utils/trackingUtils'
import { parseUserAgentLabel } from '@/utils/device'

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

const getSourceLabel = (referrer: string) => {
  if (!referrer) return '直接访问'

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, '')

    if (hostname === 'feishu.nankai.edu.cn') return '飞书微应用'

    return hostname || '直接访问'
  } catch {
    return '未知来源'
  }
}

const getSummary = async (start: Date, end: Date): Promise<TrackingSummary> => {
  const dateFilter = buildEventDateFilter(
    start.toISOString(),
    end.toISOString()
  )
  const visitorDateFilter = buildVisitorDateFilter(
    start.toISOString(),
    end.toISOString()
  )
  const pageViewFilter = {
    ...dateFilter,
    event_type: 'custom',
    event_name: 'page_view'
  }
  const playFilter = {
    ...dateFilter,
    event_type: 'custom',
    event_name: 'accordion-play'
  }

  const [
    activeVisitors,
    newVisitors,
    pageViews,
    animePlayCount,
    playVisitors,
    sessions
  ] = await Promise.all([
    prisma.trackingEvent.groupBy({
      by: ['visitor_id'],
      where: pageViewFilter
    }),
    prisma.trackingVisitor.count({ where: visitorDateFilter }),
    prisma.trackingEvent.count({ where: pageViewFilter }),
    prisma.trackingEvent.count({ where: playFilter }),
    prisma.trackingEvent.groupBy({
      by: ['visitor_id'],
      where: playFilter
    }),
    prisma.trackingEvent.groupBy({
      by: ['session_id'],
      where: { ...pageViewFilter, session_id: { not: '' } }
    })
  ])

  return {
    activeVisitors: activeVisitors.length,
    newVisitors,
    pageViews,
    animePlayCount,
    playVisitors: playVisitors.length,
    sessions: sessions.length
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
    const dateFilter = buildEventDateFilter(
      range.start.toISOString(),
      range.end.toISOString()
    )
    const pageViewFilter = {
      ...dateFilter,
      event_type: 'custom',
      event_name: 'page_view'
    }

    const [
      summary,
      previousSummary,
      totalEvents,
      pageUrlStats,
      deviceEvents,
      eventTypeStats,
      referrerStats
    ] = await Promise.all([
      getSummary(range.start, range.end),
      getSummary(previousRange.start, previousRange.end),
      prisma.trackingEvent.count({
        where: dateFilter
      }),
      prisma.trackingEvent.groupBy({
        by: ['page_url'],
        where: pageViewFilter
      }),
      prisma.trackingEvent.findMany({
        where: pageViewFilter,
        select: { visitor: { select: { user_agent: true } } }
      }),
      prisma.trackingEvent.groupBy({
        by: ['event_name'],
        where: dateFilter,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6
      }),
      prisma.trackingEvent.groupBy({
        by: ['referrer'],
        where: pageViewFilter,
        _count: { id: true }
      })
    ])

    const sourceMap = new Map<string, number>()
    referrerStats.forEach((item) => {
      const source = getSourceLabel(item.referrer)
      sourceMap.set(source, (sourceMap.get(source) || 0) + item._count.id)
    })
    const deviceMap = new Map<string, number>()
    deviceEvents.forEach((event) => {
      const device = parseUserAgentLabel(event.visitor.user_agent)
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)
    })

    return {
      summary,
      previousSummary,
      totalEvents,
      uniquePages: new Set(
        pageUrlStats.map((item) => normalizeTrackingPath(item.page_url))
      ).size,
      deviceStats: Array.from(deviceMap, ([device, count]) => ({
        device,
        count
      })).sort((a, b) => b.count - a.count),
      eventTypeStats: eventTypeStats.map((e) => ({
        type: e.event_name,
        count: e._count.id
      })),
      sourceStats: Array.from(sourceMap, ([source, count]) => ({
        source,
        count
      }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
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
    const aggregate = isHourly ? aggregateByHour : aggregateByDate

    switch (type) {
      case 'visitors': {
        const visitors = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lt: end },
            event_type: 'custom',
            event_name: 'page_view'
          },
          select: { timestamp: true, visitor_id: true }
        })

        const visitorSlotMap = new Map<string, Set<number>>()
        visitors.forEach((visitor) => {
          const date = visitor.timestamp
          const slot = isHourly
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00`
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

          if (!visitorSlotMap.has(slot)) visitorSlotMap.set(slot, new Set())
          visitorSlotMap.get(slot)?.add(visitor.visitor_id)
        })

        return slots.map((slot) => ({
          date: slot,
          value: visitorSlotMap.get(slot)?.size || 0
        }))
      }

      case 'newVisitors': {
        const visitors = await prisma.trackingVisitor.findMany({
          where: { first_seen: { gte: start, lt: end } },
          select: { first_seen: true }
        })

        const countMap = aggregate(visitors, (visitor) => visitor.first_seen)

        return mapToTrendPoints(slots, countMap)
      }

      case 'events': {
        const events = await prisma.trackingEvent.findMany({
          where: { timestamp: { gte: start, lt: end } },
          select: { timestamp: true }
        })

        const countMap = aggregate(events, (e) => e.timestamp)

        return mapToTrendPoints(slots, countMap)
      }

      case 'pageViews': {
        const pageViews = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lt: end },
            event_type: 'custom',
            event_name: 'page_view'
          },
          select: { timestamp: true }
        })

        const countMap = aggregate(pageViews, (event) => event.timestamp)

        return mapToTrendPoints(slots, countMap)
      }

      case 'pages': {
        const pageEvents = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lt: end },
            event_type: 'custom',
            event_name: 'page_view'
          },
          select: { timestamp: true, page_url: true }
        })

        const slotPagesMap = new Map<string, Set<string>>()

        pageEvents.forEach((e) => {
          let slotKey: string
          const d = e.timestamp

          if (isHourly) {
            slotKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`
          } else {
            slotKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          }

          if (!slotPagesMap.has(slotKey)) {
            slotPagesMap.set(slotKey, new Set())
          }

          slotPagesMap.get(slotKey)!.add(normalizeTrackingPath(e.page_url))
        })

        return slots.map((slot) => ({
          date: slot,
          value: slotPagesMap.get(slot)?.size || 0
        }))
      }

      case 'plays': {
        const playEvents = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lt: end },
            event_name: 'accordion-play',
            event_type: 'custom'
          },
          select: { timestamp: true }
        })

        const countMap = aggregate(playEvents, (e) => e.timestamp)

        return mapToTrendPoints(slots, countMap)
      }
    }
  } catch (error) {
    console.error('Failed to fetch trend data:', error)
    return null
  }
}
