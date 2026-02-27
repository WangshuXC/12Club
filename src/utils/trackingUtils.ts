import { prisma } from '../../prisma'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import type { TrackingPaginationInfo } from '@/types/api/tracking'

// ==================== 权限验证 ====================

/**
 * 验证管理员权限，要求 role >= 2
 * @returns payload 或 null（无权限时）
 */
export async function verifyAdminAccess() {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    console.log('[Tracking] 用户未登录')
    return null
  }

  if (payload.role < 2) {
    console.log('[Tracking] 用户权限不足, role:', payload.role)
    return null
  }

  return payload
}

// ==================== 时间范围过滤器 ====================

type DateRangeFilter<K extends string> = {
  [P in K]?: { gte?: Date; lte?: Date }
}

/**
 * 构建基于 timestamp 字段的时间范围过滤条件
 */
export function buildEventDateFilter(
  startDate?: string,
  endDate?: string
): DateRangeFilter<'timestamp'> {
  const filter: DateRangeFilter<'timestamp'> = {}
  if (!startDate && !endDate) return filter

  filter.timestamp = {}
  if (startDate) filter.timestamp.gte = new Date(startDate)
  if (endDate) filter.timestamp.lte = new Date(endDate)

  return filter
}

/**
 * 构建基于 first_seen 字段的访客时间范围过滤条件
 */
export function buildVisitorDateFilter(
  startDate?: string,
  endDate?: string
): DateRangeFilter<'first_seen'> {
  const filter: DateRangeFilter<'first_seen'> = {}
  if (!startDate && !endDate) return filter

  filter.first_seen = {}
  if (startDate) filter.first_seen.gte = new Date(startDate)
  if (endDate) filter.first_seen.lte = new Date(endDate)

  return filter
}

// ==================== 分页工具 ====================

/**
 * 计算分页跳过数
 */
export function calcSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

/**
 * 构建分页信息对象
 */
export function buildPagination(
  page: number,
  pageSize: number,
  total: number
): TrackingPaginationInfo {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
 * 对数组进行内存分页
 */
export function slicePage<T>(
  list: T[],
  page: number,
  pageSize: number
): { list: T[]; total: number } {
  const skip = calcSkip(page, pageSize)
  return {
    list: list.slice(skip, skip + pageSize),
    total: list.length
  }
}

// ==================== 用户信息批量查询 ====================

type UserBasicInfo = {
  id: number
  name: string
  avatar: string
  email: string
}

/**
 * 根据用户 ID 列表批量查询用户基本信息，返回 id -> user 映射
 */
export async function fetchUserMapByIds(
  userIds: number[]
): Promise<Map<number, UserBasicInfo>> {
  if (userIds.length === 0) return new Map()

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, avatar: true, email: true }
  })

  return new Map(users.map((u) => [u.id, u]))
}

/**
 * 从包含 user_id 的对象数组中提取并去重用户 ID
 */
export function extractUserIds<T extends { user_id: number | null }>(
  items: T[]
): number[] {
  return items
    .map((v) => v.user_id)
    .filter((id): id is number => id !== null)
}

// ==================== 趋势数据工具 ====================

/**
 * 将 Date 格式化为本地时间的 YYYY-MM-DD 字符串
 */
function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 生成日期范围内的所有日期字符串数组（YYYY-MM-DD，本地时区）
 */
export function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  )

  while (current <= endDateOnly) {
    dates.push(formatLocalDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 生成小时范围数组（HH:00 格式），覆盖 start 到 end 之间的每个整点
 */
export function generateHourRange(start: Date, end: Date): string[] {
  const hours: string[] = []
  const current = new Date(start)

  current.setMinutes(0, 0, 0)

  while (current <= end) {
    hours.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}T${String(current.getHours()).padStart(2, '0')}:00`
    )
    current.setHours(current.getHours() + 1)
  }

  return hours
}

/**
 * 将带有日期字段的记录按天聚合为计数 Map（使用本地时区）
 */
export function aggregateByDate<T>(
  records: T[],
  getDate: (record: T) => Date
): Map<string, number> {
  const countMap = new Map<string, number>()
  records.forEach((r) => {
    const dateKey = formatLocalDate(getDate(r))
    countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1)
  })
  return countMap
}

/**
 * 将带有日期字段的记录按小时聚合为计数 Map
 */
export function aggregateByHour<T>(
  records: T[],
  getDate: (record: T) => Date
): Map<string, number> {
  const countMap = new Map<string, number>()
  records.forEach((r) => {
    const d = getDate(r)
    const hourKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:00`
    countMap.set(hourKey, (countMap.get(hourKey) || 0) + 1)
  })
  return countMap
}

/**
 * 将计数 Map 与日期范围合并为趋势数据点数组（缺失日期填 0）
 */
export function mapToTrendPoints(
  dates: string[],
  countMap: Map<string, number>
): { date: string; value: number }[] {
  return dates.map((date) => ({
    date,
    value: countMap.get(date) || 0
  }))
}
