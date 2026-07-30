'use server'

import { prisma } from '@/lib/prisma'
import { buildEventDateFilter, verifyAdminAccess } from '@/utils/trackingUtils'

export type VisitorPageView = {
  id: number
  page_url: string
  page_title: string
  referrer: string
  timestamp: string
}

export type VisitorAnimePlay = {
  id: number
  page_url: string
  page_title: string
  extra_data: Record<string, unknown> | null
  timestamp: string
}

export type VisitorDetail = {
  pageViews: VisitorPageView[]
  animePlays: VisitorAnimePlay[]
}

export async function getVisitorDetail(
  visitorId: number,
  startDate?: string,
  endDate?: string
): Promise<VisitorDetail | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const dateFilter = buildEventDateFilter(startDate, endDate)
    const [pageViews, animePlays] = await Promise.all([
      prisma.trackingEvent.findMany({
        where: {
          ...dateFilter,
          visitor_id: visitorId,
          event_type: 'custom',
          event_name: 'page_view'
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
        select: {
          id: true,
          page_url: true,
          page_title: true,
          referrer: true,
          timestamp: true
        }
      }),
      prisma.trackingEvent.findMany({
        where: {
          ...dateFilter,
          visitor_id: visitorId,
          event_type: 'custom',
          event_name: 'accordion-play'
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
        select: {
          id: true,
          page_url: true,
          page_title: true,
          extra_data: true,
          timestamp: true
        }
      })
    ])

    return {
      pageViews: pageViews.map((e) => ({
        id: e.id,
        page_url: e.page_url,
        page_title: e.page_title,
        referrer: e.referrer,
        timestamp: e.timestamp.toISOString()
      })),
      animePlays: animePlays.map((e) => ({
        id: e.id,
        page_url: e.page_url,
        page_title: e.page_title,
        extra_data: e.extra_data as Record<string, unknown> | null,
        timestamp: e.timestamp.toISOString()
      }))
    }
  } catch (error) {
    console.error('Failed to fetch visitor detail:', error)
    return null
  }
}
