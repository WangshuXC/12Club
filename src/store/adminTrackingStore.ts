'use client'

import { create } from 'zustand'

export type QuickRangeType =
  | '24h'
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'custom'

interface TrackingDateState {
  startDate: string
  endDate: string
  /** 当前激活的快捷范围类型 */
  activeRange: QuickRangeType
  /** 自增计数器，每次点击"查询"时 +1，子路由监听此值触发重新加载 */
  queryVersion: number
}

interface TrackingDateStore extends TrackingDateState {
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  /** 触发查询（递增 queryVersion） */
  triggerQuery: () => void
  /** 设置快捷日期范围并立即触发查询 */
  setQuickRange: (days: number) => void
  /** 设置最近24小时范围并立即触发查询 */
  setLast24h: () => void
  /** 设置当天数据范围并立即触发查询 */
  setToday: () => void
  /** 获取用于查询的 ISO 时间范围 */
  getQueryRange: () => { startISO: string; endISO: string }
}

const getLast24hDates = () => {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

const defaults = getLast24hDates()

export const useTrackingDateStore = create<TrackingDateStore>()(
  (set, get) => ({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    activeRange: '24h',
    queryVersion: 0,

    setStartDate: (date) => set({ startDate: date, activeRange: 'custom' }),
    setEndDate: (date) => set({ endDate: date, activeRange: 'custom' }),

    triggerQuery: () =>
      set((state) => ({ queryVersion: state.queryVersion + 1 })),

    setQuickRange: (days) => {
      const end = new Date()
      const start = new Date()

      start.setDate(start.getDate() - days)

      const rangeMap: Record<number, QuickRangeType> = {
        7: '7d',
        30: '30d',
        90: '90d'
      }

      set((state) => ({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        activeRange: rangeMap[days] || 'custom',
        queryVersion: state.queryVersion + 1
      }))
    },

    setLast24h: () => {
      const end = new Date()
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)

      set((state) => ({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        activeRange: '24h',
        queryVersion: state.queryVersion + 1
      }))
    },

    setToday: () => {
      const today = new Date().toISOString().split('T')[0]

      set((state) => ({
        startDate: today,
        endDate: today,
        activeRange: 'today',
        queryVersion: state.queryVersion + 1
      }))
    },

    getQueryRange: () => {
      const { activeRange, startDate, endDate } = get()

      if (activeRange === '24h') {
        const end = new Date()
        const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)

        return {
          startISO: start.toISOString(),
          endISO: end.toISOString()
        }
      }

      if (activeRange === 'today') {
        const now = new Date()
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        )
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0,
          0,
          0,
          0
        )

        return {
          startISO: start.toISOString(),
          endISO: end.toISOString()
        }
      }

      return {
        startISO: startDate ? new Date(startDate).toISOString() : '',
        endISO: endDate
          ? new Date(endDate + 'T23:59:59').toISOString()
          : ''
      }
    }
  })
)
