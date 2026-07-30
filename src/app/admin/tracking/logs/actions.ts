'use server'

import { prisma } from '@/lib/prisma'
import {
  buildEventDateFilter,
  buildPagination,
  calcSkip,
  extractUserIds,
  fetchUserMapByIds,
  verifyAdminAccess
} from '@/utils/trackingUtils'

import type {
  TrackingPaginationInfo,
  TrackingPaginationResult
} from '@/types/api/tracking'

export type TrackingLogItem = {
  id: number
  event_type: string
  event_name: string
  element_id: string
  element_tag: string
  page_url: string
  page_title: string
  referrer: string
  extra_data: Record<string, unknown> | null
  viewport: string
  screen: string
  device_type: string
  visitor_id: number
  user_id: number | null
  session_id: string
  timestamp: string
  visitor: {
    guid: string
    user_agent: string
    ip: string
  }
  user: {
    id: number
    name: string
    avatar: string
    email: string
  } | null
}

export type TrackingLogPaginationInfo = TrackingPaginationInfo

/** Fetch raw tracking events in deterministic reverse chronological order. */
export async function getTrackingLogs(
  startDate?: string,
  endDate?: string,
  page = 1,
  pageSize = 50
): Promise<TrackingPaginationResult<TrackingLogItem> | null> {
  try {
    if (!(await verifyAdminAccess())) return null

    const where = buildEventDateFilter(startDate, endDate)
    const skip = calcSkip(page, pageSize)
    const [total, events] = await Promise.all([
      prisma.trackingEvent.count({ where }),
      prisma.trackingEvent.findMany({
        where,
        orderBy: [{ timestamp: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
        select: {
          id: true,
          event_type: true,
          event_name: true,
          element_id: true,
          element_tag: true,
          page_url: true,
          page_title: true,
          referrer: true,
          extra_data: true,
          viewport: true,
          screen: true,
          device_type: true,
          visitor_id: true,
          user_id: true,
          session_id: true,
          timestamp: true,
          visitor: {
            select: {
              guid: true,
              user_agent: true,
              ip: true
            }
          }
        }
      })
    ])
    const userMap = await fetchUserMapByIds(extractUserIds(events))

    return {
      list: events.map((event) => ({
        ...event,
        extra_data: event.extra_data as Record<string, unknown> | null,
        timestamp: event.timestamp.toISOString(),
        user: event.user_id ? userMap.get(event.user_id) || null : null
      })),
      pagination: buildPagination(page, pageSize, total)
    }
  } catch (error) {
    console.error('Failed to fetch tracking logs:', error)
    return null
  }
}
