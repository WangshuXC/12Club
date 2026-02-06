import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ParseGetQuery } from '@/utils/parseQuery'

import { prisma } from '../../../../../../prisma'
import { buildVisitorDateFilter } from '../utils'

import type {
  TrackingVisitorStatsItem,
  TrackingPaginationResult
} from '@/types/api/tracking'

// 查询参数 Schema
const QuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).max(100).optional().default(20)
})

// GET - 获取访客列表统计
export async function GET(req: NextRequest) {
  try {
    const query = ParseGetQuery(req, QuerySchema)
    if (typeof query === 'string') {
      return NextResponse.json({ error: query }, { status: 400 })
    }

    const { startDate, endDate, page, pageSize } = query
    const visitorDateFilter = buildVisitorDateFilter(startDate, endDate)
    const skip = (page - 1) * pageSize

    const [visitors, total] = await Promise.all([
      prisma.trackingVisitor.findMany({
        where: visitorDateFilter,
        orderBy: { last_seen: 'desc' },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { events: true }
          }
        }
      }),
      prisma.trackingVisitor.count({
        where: visitorDateFilter
      })
    ])

    const data: TrackingPaginationResult<TrackingVisitorStatsItem> = {
      list: visitors.map((v) => ({
        id: v.id,
        guid: v.guid,
        user_id: v.user_id,
        user_agent: v.user_agent,
        ip: v.ip,
        first_seen: v.first_seen,
        last_seen: v.last_seen,
        events_count: v._count.events
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Tracking visitors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
