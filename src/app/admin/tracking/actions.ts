'use server'

import {
  verifyAdminAccess,
  buildEventDateFilter,
  buildVisitorDateFilter,
  generateDateRange,
  generateHourRange,
  aggregateByDate,
  aggregateByHour,
  mapToTrendPoints
} from '@/utils/trackingUtils'

import { prisma } from '../../../../prisma'

import type { TrackingOverviewResult } from '@/types/api/tracking'

// 重新导出类型供组件使用
export type TrackingOverview = TrackingOverviewResult

// 趋势数据类型
export type TrendDataPoint = {
  date: string
  value: number
}

export type TrendType = 'visitors' | 'events' | 'pages' | 'plays'

export type TrendGranularity = 'hour' | 'day'

// 获取概览统计
export async function getTrackingOverview(
  startDate?: string,
  endDate?: string
): Promise<TrackingOverview | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const dateFilter = buildEventDateFilter(startDate, endDate)
    const visitorDateFilter = buildVisitorDateFilter(startDate, endDate)

    const [
      totalVisitors,
      totalEvents,
      uniquePageViews,
      deviceStats,
      eventTypeStats
    ] = await Promise.all([
      prisma.trackingVisitor.count({
        where: visitorDateFilter
      }),
      prisma.trackingEvent.count({
        where: dateFilter
      }),
      prisma.trackingEvent.groupBy({
        by: ['page_url'],
        where: dateFilter,
        _count: { id: true }
      }),
      prisma.trackingEvent.groupBy({
        by: ['device_type'],
        where: dateFilter,
        _count: { id: true }
      }),
      prisma.trackingEvent.groupBy({
        by: ['event_type'],
        where: dateFilter,
        _count: { id: true }
      })
    ])

    const animePlayStats = await prisma.trackingEvent.count({
      where: {
        ...dateFilter,
        event_name: 'accordion-play',
        event_type: 'custom'
      }
    })

    return {
      totalVisitors,
      totalEvents,
      uniquePages: uniquePageViews.length,
      animePlayCount: animePlayStats,
      deviceStats: deviceStats.map((d) => ({
        device: d.device_type,
        count: d._count.id
      })),
      eventTypeStats: eventTypeStats.map((e) => ({
        type: e.event_type,
        count: e._count.id
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

    // 默认获取最近30天的数据
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

    const isHourly = granularity === 'hour'
    const slots = isHourly
      ? generateHourRange(start, end)
      : generateDateRange(start, end)
    const aggregate = isHourly ? aggregateByHour : aggregateByDate

    switch (type) {
      case 'visitors': {
        const visitors = await prisma.trackingVisitor.findMany({
          where: { first_seen: { gte: start, lte: end } },
          select: { first_seen: true }
        })

        const countMap = aggregate(visitors, (v) => v.first_seen)

        return mapToTrendPoints(slots, countMap)
      }

      case 'events': {
        const events = await prisma.trackingEvent.findMany({
          where: { timestamp: { gte: start, lte: end } },
          select: { timestamp: true }
        })

        const countMap = aggregate(events, (e) => e.timestamp)

        return mapToTrendPoints(slots, countMap)
      }

      case 'pages': {
        const pageEvents = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lte: end }
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

          slotPagesMap.get(slotKey)!.add(e.page_url)
        })

        return slots.map((slot) => ({
          date: slot,
          value: slotPagesMap.get(slot)?.size || 0
        }))
      }

      case 'plays': {
        const playEvents = await prisma.trackingEvent.findMany({
          where: {
            timestamp: { gte: start, lte: end },
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
