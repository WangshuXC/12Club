'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import type { SortDescriptor } from '@heroui/react'

import {
  getVisitorStats,
  type VisitorStats,
  type PaginationInfo,
  type VisitorSortBy,
  type VisitorSortDirection
} from '@/app/admin/tracking/visitors/actions'
import {
  useTrackingDateStore,
  type TrackingQueryRange
} from '@/store/adminTrackingStore'

import { VisitorStatsTable } from './VisitorStatsTab'

export const VisitorStatsContainer = () => {
  const queryVersion = useTrackingDateStore((state) => state.queryVersion)
  const [loading, setLoading] = useState(false)
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'last_active',
    direction: 'descending'
  })
  const [range, setRange] = useState<TrackingQueryRange>(() =>
    useTrackingDateStore.getState().getQueryRange()
  )
  const initialLoaded = useRef(false)

  const loadData = useCallback(
    async (
      page = 1,
      descriptor: SortDescriptor = {
        column: 'last_active',
        direction: 'descending'
      }
    ) => {
      setLoading(true)
      const queryRange = useTrackingDateStore.getState().getQueryRange()

      try {
        const data = await getVisitorStats(
          queryRange.startISO || undefined,
          queryRange.endISO || undefined,
          page,
          20,
          descriptor.column.toString() as VisitorSortBy,
          descriptor.direction as VisitorSortDirection
        )

        if (data) {
          setVisitorStats(data.list)
          setPagination(data.pagination)
          setRange(queryRange)
        }
      } catch (error) {
        console.error('Failed to load visitor stats:', error)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 初始加载
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true
      loadData(1, sortDescriptor)
    }
  }, [loadData, sortDescriptor])

  // 监听查询版本变化
  useEffect(() => {
    if (queryVersion > 0) {
      loadData(1, sortDescriptor)
    }
  }, [queryVersion, loadData, sortDescriptor])

  const handlePageChange = (page: number) => {
    loadData(page, sortDescriptor)
  }

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
    loadData(1, descriptor)
  }

  return (
    <VisitorStatsTable
      data={visitorStats}
      pagination={pagination}
      onPageChange={handlePageChange}
      loading={loading}
      range={range}
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
    />
  )
}
