import type {
    TrackingDateFilter,
    TrackingVisitorDateFilter
} from '@/types/api/tracking'

// 构建日期过滤器
export const buildDateFilter = (
    startDate?: string,
    endDate?: string
): TrackingDateFilter => {
    const dateFilter: TrackingDateFilter = {}
    if (startDate || endDate) {
        dateFilter.timestamp = {}
        if (startDate) {
            dateFilter.timestamp.gte = new Date(startDate)
        }
        if (endDate) {
            dateFilter.timestamp.lte = new Date(endDate)
        }
    }
    return dateFilter
}

// 构建访客日期过滤器
export const buildVisitorDateFilter = (
    startDate?: string,
    endDate?: string
): TrackingVisitorDateFilter => {
    const visitorDateFilter: TrackingVisitorDateFilter = {}
    if (startDate || endDate) {
        visitorDateFilter.first_seen = {}
        if (startDate) {
            visitorDateFilter.first_seen.gte = new Date(startDate)
        }
        if (endDate) {
            visitorDateFilter.first_seen.lte = new Date(endDate)
        }
    }
    return visitorDateFilter
}
