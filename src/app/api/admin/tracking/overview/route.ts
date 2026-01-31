import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../prisma'
import { ParseGetQuery } from '@/utils/parseQuery'
import { buildDateFilter, buildVisitorDateFilter } from '../utils'
import type { TrackingOverviewResult } from '@/types/api/tracking'

// 查询参数 Schema
const QuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
})

// GET - 获取概览统计数据
export async function GET(req: NextRequest) {
    try {
        const query = ParseGetQuery(req, QuerySchema)
        if (typeof query === 'string') {
            return NextResponse.json({ error: query }, { status: 400 })
        }

        const { startDate, endDate } = query
        const dateFilter = buildDateFilter(startDate, endDate)
        const visitorDateFilter = buildVisitorDateFilter(startDate, endDate)

        const [
            totalVisitors,
            totalEvents,
            uniquePageViews,
            deviceStats,
            eventTypeStats
        ] = await Promise.all([
            // 总访客数
            prisma.trackingVisitor.count({
                where: visitorDateFilter
            }),
            // 总事件数
            prisma.trackingEvent.count({
                where: dateFilter
            }),
            // 独立页面访问数
            prisma.trackingEvent.groupBy({
                by: ['page_url'],
                where: dateFilter,
                _count: { id: true }
            }),
            // 设备类型分布
            prisma.trackingEvent.groupBy({
                by: ['device_type'],
                where: dateFilter,
                _count: { id: true }
            }),
            // 事件类型分布
            prisma.trackingEvent.groupBy({
                by: ['event_type'],
                where: dateFilter,
                _count: { id: true }
            })
        ])

        // 动漫播放统计（基于 accordion-play 事件）
        const animePlayStats = await prisma.trackingEvent.count({
            where: {
                ...dateFilter,
                event_name: 'accordion-play',
                event_type: 'click'
            }
        })

        const data: TrackingOverviewResult = {
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

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Tracking overview error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
