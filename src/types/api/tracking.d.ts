// ==================== 埋点统计 API 类型定义 ====================

// 时间范围过滤器类型
export interface TrackingDateFilter {
  timestamp?: {
    gte?: Date
    lte?: Date
  }
}

export interface TrackingVisitorDateFilter {
  first_seen?: {
    gte?: Date
    lte?: Date
  }
}

// 分页信息
export interface TrackingPaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 分页结果
export interface TrackingPaginationResult<T> {
  list: T[]
  pagination: TrackingPaginationInfo
}

// ==================== 概览统计 ====================
export interface TrackingOverviewResult {
  totalVisitors: number
  totalEvents: number
  uniquePages: number
  animePlayCount: number
  deviceStats: Array<{ device: string; count: number }>
  eventTypeStats: Array<{ type: string; count: number }>
}

// ==================== 页面统计 ====================
export interface TrackingPageStatsItem {
  page_url: string
  page_title: string
  total_views: number
  unique_visitors: number
}

// ==================== 动漫统计 ====================
export interface TrackingAnimeStatsItem {
  dbid: string
  name: string
  banner: string
  status: number
  playCount: number
  uniqueVisitors: number
  accordionStats: Array<{
    accordion: string
    playCount: number
  }>
}

// ==================== 访客统计 ====================
export interface TrackingVisitorStatsItem {
  id: number
  guid: string
  user_id: number | null
  user_agent: string
  ip: string
  first_seen: Date
  last_seen: Date
  events_count: number
}
