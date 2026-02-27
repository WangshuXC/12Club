'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import {
  getVisitorStats,
  type VisitorStats,
  type PaginationInfo
} from '@/app/admin/tracking/visitors/actions'
import { useTrackingDateStore } from '@/store/adminTrackingStore'

import { VisitorStatsTable } from './VisitorStatsTab'

export const VisitorStatsContainer = () => {
  const { startDate, endDate, queryVersion } = useTrackingDateStore()
  const [loading, setLoading] = useState(false)
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const initialLoaded = useRef(false)

  const loadData = useCallback(
    async (page = 1) => {
      setLoading(true)

      try {
        const { startISO, endISO } = useTrackingDateStore.getState().getQueryRange()
        const data = await getVisitorStats(
          startISO || undefined,
          endISO || undefined,
          page,
          20
        )

        if (data) {
          setVisitorStats(data.list)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Failed to load visitor stats:', error)
      } finally {
        setLoading(false)
      }
    },
    [startDate, endDate]
  )

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
    <VisitorStatsTable
      data={visitorStats}
      pagination={pagination}
      onPageChange={handlePageChange}
      loading={loading}
    />
  )
}
