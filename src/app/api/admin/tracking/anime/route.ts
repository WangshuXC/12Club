import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ParseGetQuery } from '@/utils/parseQuery'

import { prisma } from '../../../../../../prisma'
import { buildDateFilter } from '../utils'

import type {
  TrackingAnimeStatsItem,
  TrackingPaginationResult
} from '@/types/api/tracking'

// 查询参数 Schema
const QuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20)
})

// GET - 获取动漫播放统计
export async function GET(req: NextRequest) {
  try {
    const query = ParseGetQuery(req, QuerySchema)
    if (typeof query === 'string') {
      return NextResponse.json({ error: query }, { status: 400 })
    }

    const { startDate, endDate, page, pageSize } = query
    const dateFilter = buildDateFilter(startDate, endDate)
    const skip = (page - 1) * pageSize

    const animeEvents = await prisma.trackingEvent.findMany({
      where: {
        ...dateFilter,
        event_name: 'accordion-play',
        event_type: 'custom'
      },
      select: {
        id: true,
        event_type: true,
        extra_data: true,
        timestamp: true,
        visitor_id: true
      }
    })

    // 按动漫 ID 分组统计
    const animeStatsMap = new Map<
      string,
      {
        dbid: string
        playCount: number
        uniqueVisitors: Set<number>
        accordionStats: Map<string, number>
      }
    >()

    animeEvents.forEach((event) => {
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

      // 每次播放事件算作一次播放
      stats.playCount++

      if (!stats.accordionStats.has(accordion)) {
        stats.accordionStats.set(accordion, 0)
      }

      stats.accordionStats.set(
        accordion,
        stats.accordionStats.get(accordion)! + 1
      )
    })

    // 获取所有涉及的 dbid
    const dbids = Array.from(animeStatsMap.keys())

    // 批量查询资源详情
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

    // 创建 dbid 到资源的映射
    const resourceMap = new Map(resources.map((r) => [r.db_id, r]))

    // 转换为数组并排序
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

    const total = animeStatsList.length
    const paginatedList = animeStatsList.slice(skip, skip + pageSize)

    const data: TrackingPaginationResult<TrackingAnimeStatsItem> = {
      list: paginatedList,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Tracking anime error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
