'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import {
  getPageStats,
  type PageStats,
  type PaginationInfo
} from '@/app/admin/tracking/pages/actions'
import {
  useTrackingDateStore,
  type TrackingQueryRange
} from '@/store/adminTrackingStore'

import { PageStatsTable } from './PageStatsTab'

export const PageStatsContainer = () => {
  const queryVersion = useTrackingDateStore((state) => state.queryVersion)
  const [loading, setLoading] = useState(false)
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [range, setRange] = useState<TrackingQueryRange>(() =>
    useTrackingDateStore.getState().getQueryRange()
  )
  const initialLoaded = useRef(false)

  const loadData = useCallback(async (page = 1) => {
    setLoading(true)
    const queryRange = useTrackingDateStore.getState().getQueryRange()

    try {
      const data = await getPageStats(
        queryRange.startISO || undefined,
        queryRange.endISO || undefined,
        page,
        20
      )

      if (data) {
        setPageStats(data.list)
        setPagination(data.pagination)
        setRange(queryRange)
      }
    } catch (error) {
      console.error('Failed to load page stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true
      loadData()
    }
  }, [loadData])

  // 监听查询版本变化
  useEffect(() => {
    if (queryVersion > 0) {
      loadData(1)
    }
  }, [queryVersion, loadData])

  const handlePageChange = (page: number) => {
    loadData(page)
  }

  return (
    <PageStatsTable
      data={pageStats}
      pagination={pagination}
      onPageChange={handlePageChange}
      loading={loading}
      range={range}
    />
  )
}
