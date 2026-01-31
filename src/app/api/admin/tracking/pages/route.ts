import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../../prisma'
import { ParseGetQuery } from '@/utils/parseQuery'
import { buildDateFilter } from '../utils'
import type {
    TrackingPageStatsItem,
    TrackingPaginationResult
} from '@/types/api/tracking'

// 查询参数 Schema
const QuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().min(1).optional().default(1),
    pageSize: z.coerce.number().min(1).max(100).optional().default(20)
})

// GET - 获取页面访问统计
export async function GET(req: NextRequest) {
    try {
        const query = ParseGetQuery(req, QuerySchema)
        if (typeof query === 'string') {
            return NextResponse.json({ error: query }, { status: 400 })
        }

        const { startDate, endDate, page, pageSize } = query
        const dateFilter = buildDateFilter(startDate, endDate)
        const skip = (page - 1) * pageSize

        // 获取页面访问统计
        const pageStats = await prisma.trackingEvent.groupBy({
            by: ['page_url', 'page_title'],
            where: {
                ...dateFilter,
                event_type: 'expose'
            },
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            }
        })

        // 手动分页（groupBy不支持skip/take）
        const total = pageStats.length
        const paginatedStats = pageStats.slice(skip, skip + pageSize)

        // 获取每个页面的独立访客数
        const pageVisitorStats = await Promise.all(
            paginatedStats.map(async (stat) => {
                const uniqueVisitors = await prisma.trackingEvent.groupBy({
                    by: ['visitor_id'],
                    where: {
                        ...dateFilter,
                        page_url: stat.page_url,
                        event_type: 'expose'
                    }
                })
                return {
                    page_url: stat.page_url,
                    page_title: stat.page_title || '未知页面',
                    total_views: stat._count.id,
                    unique_visitors: uniqueVisitors.length
                }
            })
        )

        const data: TrackingPaginationResult<TrackingPageStatsItem> = {
            list: pageVisitorStats,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Tracking pages error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
