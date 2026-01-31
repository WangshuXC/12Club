'use server'

import { prisma } from '../../../../prisma'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import type { Prisma } from '@prisma/client'
import type {
    TrackingOverviewResult,
    TrackingPageStatsItem,
    TrackingAnimeStatsItem,
    TrackingVisitorStatsItem,
    TrackingPaginationInfo,
    TrackingPaginationResult
} from '@/types/api/tracking'

// 定义带有事件计数的访客类型
type VisitorWithEventsCount = Prisma.TrackingVisitorGetPayload<{
    include: { _count: { select: { events: true } } }
}>

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

// 重新导出类型供组件使用
export type TrackingOverview = TrackingOverviewResult
export type PageStats = TrackingPageStatsItem
export type AnimeStats = TrackingAnimeStatsItem
export type VisitorStats = TrackingVisitorStatsItem & {
    first_seen: string
    last_seen: string
    user: {
        id: number
        name: string
        avatar: string
        email: string
    } | null
}
export type PaginationInfo = TrackingPaginationInfo

// 趋势数据类型
export type TrendDataPoint = {
    date: string
    value: number
}

export type TrendType = 'visitors' | 'events' | 'pages' | 'plays'

// 获取概览统计
export async function getTrackingOverview(
    startDate?: string,
    endDate?: string
): Promise<TrackingOverview | null> {
    try {
        const payload = await verifyHeaderCookie()
        if (!payload) {
            console.log('[Tracking] 用户未登录')
            return null
        }
        if (payload.role < 2) {
            console.log('[Tracking] 用户权限不足, role:', payload.role)
            return null
        }

        // 构建时间范围条件
        const dateFilter: { timestamp?: { gte?: Date; lte?: Date } } = {}
        if (startDate || endDate) {
            dateFilter.timestamp = {}
            if (startDate) {
                dateFilter.timestamp.gte = new Date(startDate)
            }
            if (endDate) {
                dateFilter.timestamp.lte = new Date(endDate)
            }
        }

        // 访客时间范围条件
        const visitorDateFilter: { first_seen?: { gte?: Date; lte?: Date } } = {}
        if (startDate || endDate) {
            visitorDateFilter.first_seen = {}
            if (startDate) {
                visitorDateFilter.first_seen.gte = new Date(startDate)
            }
            if (endDate) {
                visitorDateFilter.first_seen.lte = new Date(endDate)
            }
        }

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
                event_type: 'click'
            }
        })

        // 即使没有数据，也返回一个有效的对象（全为0），而不是null
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

// 获取页面访问统计
export async function getPageStats(
    startDate?: string,
    endDate?: string,
    page = 1,
    pageSize = 20
): Promise<TrackingPaginationResult<PageStats> | null> {
    try {
        const payload = await verifyHeaderCookie()
        if (!payload || payload.role < 2) {
            return null
        }

        const skip = (page - 1) * pageSize

        // 构建时间范围条件
        const dateFilter: { timestamp?: { gte?: Date; lte?: Date } } = {}
        if (startDate || endDate) {
            dateFilter.timestamp = {}
            if (startDate) {
                dateFilter.timestamp.gte = new Date(startDate)
            }
            if (endDate) {
                dateFilter.timestamp.lte = new Date(endDate)
            }
        }

        const pageStatsResult = await prisma.trackingEvent.groupBy({
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

        const total = pageStatsResult.length
        const paginatedStats = pageStatsResult.slice(skip, skip + pageSize)

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

        return {
            list: pageVisitorStats,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        }
    } catch (error) {
        console.error('Failed to fetch page stats:', error)
        return null
    }
}

// 获取动漫播放统计
export async function getAnimeStats(
    startDate?: string,
    endDate?: string,
    page = 1,
    pageSize = 20
): Promise<TrackingPaginationResult<AnimeStats> | null> {
    try {
        const payload = await verifyHeaderCookie()
        if (!payload || payload.role < 2) {
            return null
        }

        const skip = (page - 1) * pageSize

        // 构建时间范围条件
        const dateFilter: { timestamp?: { gte?: Date; lte?: Date } } = {}
        if (startDate || endDate) {
            dateFilter.timestamp = {}
            if (startDate) {
                dateFilter.timestamp.gte = new Date(startDate)
            }
            if (endDate) {
                dateFilter.timestamp.lte = new Date(endDate)
            }
        }

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
            // 曝光和点击都算作一次播放
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
                        .sort(
                            (a, b) =>
                                parseInt(a.accordion) - parseInt(b.accordion)
                        )
                }
            })
            .sort((a, b) => b.playCount - a.playCount)

        const total = animeStatsList.length
        const paginatedList = animeStatsList.slice(skip, skip + pageSize)

        return {
            list: paginatedList,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        }
    } catch (error) {
        console.error('Failed to fetch anime stats:', error)
        return null
    }
}

// 获取访客统计
export async function getVisitorStats(
    startDate?: string,
    endDate?: string,
    page = 1,
    pageSize = 20
): Promise<TrackingPaginationResult<VisitorStats> | null> {
    try {
        const payload = await verifyHeaderCookie()
        if (!payload || payload.role < 2) {
            return null
        }

        const skip = (page - 1) * pageSize

        // 访客时间范围条件
        const visitorDateFilter: { first_seen?: { gte?: Date; lte?: Date } } = {}
        if (startDate || endDate) {
            visitorDateFilter.first_seen = {}
            if (startDate) {
                visitorDateFilter.first_seen.gte = new Date(startDate)
            }
            if (endDate) {
                visitorDateFilter.first_seen.lte = new Date(endDate)
            }
        }

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

        // 获取所有关联的用户ID
        const userIds = visitors
            .map((v) => v.user_id)
            .filter((id): id is number => id !== null)

        // 批量查询用户信息
        const users = userIds.length > 0
            ? await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, avatar: true, email: true }
            })
            : []

        // 创建用户ID到用户信息的映射
        const userMap = new Map(users.map((u) => [u.id, u]))

        return {
            list: visitors.map((v: VisitorWithEventsCount) => ({
                id: v.id,
                guid: v.guid,
                user_id: v.user_id,
                user_agent: v.user_agent,
                ip: v.ip,
                first_seen: v.first_seen.toISOString(),
                last_seen: v.last_seen.toISOString(),
                events_count: v._count.events,
                user: v.user_id ? userMap.get(v.user_id) || null : null
            })),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize)
            }
        }
    } catch (error) {
        console.error('Failed to fetch visitor stats:', error)
        return null
    }
}

// 获取趋势数据
export async function getTrendData(
    type: TrendType,
    startDate?: string,
    endDate?: string
): Promise<TrendDataPoint[] | null> {
    try {
        const payload = await verifyHeaderCookie()
        if (!payload || payload.role < 2) {
            return null
        }

        // 默认获取最近30天的数据
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date()
        const start = startDate
            ? new Date(startDate)
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000)

        // 生成日期范围
        const dates: string[] = []
        const current = new Date(start)
        const endDateOnly = new Date(end.toISOString().split('T')[0])
        while (current <= endDateOnly) {
            dates.push(current.toISOString().split('T')[0])
            current.setDate(current.getDate() + 1)
        }

        let result: TrendDataPoint[] = []

        switch (type) {
            case 'visitors': {
                // 按天统计新访客数
                const visitors = await prisma.trackingVisitor.findMany({
                    where: {
                        first_seen: {
                            gte: start,
                            lte: end
                        }
                    },
                    select: {
                        first_seen: true
                    }
                })

                const countMap = new Map<string, number>()
                visitors.forEach((v) => {
                    const dateKey = v.first_seen.toISOString().split('T')[0]
                    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1)
                })

                result = dates.map((date) => ({
                    date,
                    value: countMap.get(date) || 0
                }))
                break
            }

            case 'events': {
                // 按天统计事件数
                const events = await prisma.trackingEvent.findMany({
                    where: {
                        timestamp: {
                            gte: start,
                            lte: end
                        }
                    },
                    select: {
                        timestamp: true
                    }
                })

                const countMap = new Map<string, number>()
                events.forEach((e) => {
                    const dateKey = e.timestamp.toISOString().split('T')[0]
                    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1)
                })

                result = dates.map((date) => ({
                    date,
                    value: countMap.get(date) || 0
                }))
                break
            }

            case 'pages': {
                // 按天统计独立页面访问数
                const pageEvents = await prisma.trackingEvent.findMany({
                    where: {
                        timestamp: {
                            gte: start,
                            lte: end
                        },
                        event_type: 'expose'
                    },
                    select: {
                        timestamp: true,
                        page_url: true
                    }
                })

                // 按天分组，统计每天的独立页面数
                const dayPagesMap = new Map<string, Set<string>>()
                pageEvents.forEach((e) => {
                    const dateKey = e.timestamp.toISOString().split('T')[0]
                    if (!dayPagesMap.has(dateKey)) {
                        dayPagesMap.set(dateKey, new Set())
                    }
                    dayPagesMap.get(dateKey)!.add(e.page_url)
                })

                result = dates.map((date) => ({
                    date,
                    value: dayPagesMap.get(date)?.size || 0
                }))
                break
            }

            case 'plays': {
                // 按天统计动漫播放次数
                const playEvents = await prisma.trackingEvent.findMany({
                    where: {
                        timestamp: {
                            gte: start,
                            lte: end
                        },
                        event_name: 'accordion-play',
                        event_type: 'click'
                    },
                    select: {
                        timestamp: true
                    }
                })

                const countMap = new Map<string, number>()
                playEvents.forEach((e) => {
                    const dateKey = e.timestamp.toISOString().split('T')[0]
                    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1)
                })

                result = dates.map((date) => ({
                    date,
                    value: countMap.get(date) || 0
                }))
                break
            }
        }

        return result
    } catch (error) {
        console.error('Failed to fetch trend data:', error)
        return null
    }
}
