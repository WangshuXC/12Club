'use server'

import {
  verifyAdminAccess,
  buildEventDateFilter,
  buildPagination,
  slicePage,
  fetchUserMapByIds,
  extractUserIds
} from '@/utils/trackingUtils'

import { prisma } from '../../../../../prisma'

import type {
  TrackingAnimeStatsItem,
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'
import type { Prisma } from '@prisma/client'

// 定义动漫事件查询结果类型
type AnimeEventSelect = Prisma.TrackingEventGetPayload<{
  select: {
    id: true
    event_type: true
    extra_data: true
    timestamp: true
    visitor_id: true
  }
}>

export type AnimeStats = TrackingAnimeStatsItem

export type PaginationInfo = TrackingPaginationInfo

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
  pageSize = 20
): Promise<TrackingPaginationResult<AnimeStats> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const dateFilter = buildEventDateFilter(startDate, endDate)

    const animeEvents = await prisma.trackingEvent.findMany({
      where: {
        ...dateFilter,
        event_name: 'accordion-play'
      },
      select: {
        id: true,
        event_type: true,
        extra_data: true,
        timestamp: true,
        visitor_id: true
      }
    })

    const animeStatsMap = new Map<
      string,
      {
        dbid: string
        playCount: number
        uniqueVisitors: Set<number>
        accordionStats: Map<string, number>
      }
    >()

    animeEvents.forEach((event: AnimeEventSelect) => {
      const extraData = event.extra_data as Record<string, unknown> | null
      if (!extraData) return

      const dbid = String(extraData['dbid'] || '')
      const accordion = String(extraData['accordion'] || '1')

      if (!dbid) return

      if (!animeStatsMap.has(dbid)) {
        animeStatsMap.set(dbid, {
          dbid,
          playCount: 0,
          uniqueVisitors: new Set(),
          accordionStats: new Map()
        })
      }

      const stats = animeStatsMap.get(dbid)!
      stats.uniqueVisitors.add(event.visitor_id)
      stats.playCount++

      if (!stats.accordionStats.has(accordion)) {
        stats.accordionStats.set(accordion, 0)
      }

      stats.accordionStats.set(
        accordion,
        stats.accordionStats.get(accordion)! + 1
      )
    })

    const dbids = Array.from(animeStatsMap.keys())

    const resources = await prisma.resource.findMany({
      where: {
        db_id: { in: dbids }
      },
      select: {
        db_id: true,
        name: true,
        image_url: true,
        status: true
      }
    })

    const resourceMap = new Map(resources.map((r) => [r.db_id, r]))

    const animeStatsList = Array.from(animeStatsMap.values())
      .map((stat) => {
        const resource = resourceMap.get(stat.dbid)

        return {
          dbid: stat.dbid,
          name: resource?.name || '未知动漫',
          banner: resource?.image_url || '',
          status: resource?.status || 0,
          playCount: stat.playCount,
          uniqueVisitors: stat.uniqueVisitors.size,
          accordionStats: Array.from(stat.accordionStats.entries())
            .map(([acc, count]) => ({
              accordion: acc,
              playCount: count
            }))
            .sort((a, b) => parseInt(a.accordion) - parseInt(b.accordion))
        }
      })
      .sort((a, b) => b.playCount - a.playCount)

    const { list, total } = slicePage(animeStatsList, page, pageSize)

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

    const dateFilter = buildEventDateFilter(startDate, endDate)

    const animeEvents = await prisma.trackingEvent.findMany({
      where: {
        ...dateFilter,
        event_name: 'accordion-play'
      },
      select: {
        visitor_id: true,
        extra_data: true
      }
    })

    const visitorCountMap = new Map<number, number>()

    animeEvents.forEach((event) => {
      const extraData = event.extra_data as Record<string, unknown> | null
      if (!extraData) return

      const eventDbid = String(extraData['dbid'] || '')
      if (eventDbid !== dbid) return

      visitorCountMap.set(
        event.visitor_id,
        (visitorCountMap.get(event.visitor_id) || 0) + 1
      )
    })

    const sortedVisitors = Array.from(visitorCountMap.entries()).sort(
      (a, b) => b[1] - a[1]
    )

    const { list: paginatedVisitors, total } = slicePage(
      sortedVisitors,
      page,
      pageSize
    )
    const visitorIds = paginatedVisitors.map(([id]) => id)

    const visitors = await prisma.trackingVisitor.findMany({
      where: { id: { in: visitorIds } }
    })

    const visitorMap = new Map(visitors.map((v) => [v.id, v]))
    const userIds = extractUserIds(visitors)
    const userMap = await fetchUserMapByIds(userIds)

    const result: AnimeVisitor[] = paginatedVisitors.map(
      ([visitorId, count]) => {
        const visitor = visitorMap.get(visitorId)!

        return {
          id: visitor.id,
          guid: visitor.guid,
          user_id: visitor.user_id,
          user_agent: visitor.user_agent,
          ip: visitor.ip,
          first_seen: visitor.first_seen.toISOString(),
          last_seen: visitor.last_seen.toISOString(),
          visit_count: count,
          user: visitor.user_id ? userMap.get(visitor.user_id) || null : null
        }
      }
    )

    return {
      list: result,
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch anime visitors:', error)
    return null
  }
}
