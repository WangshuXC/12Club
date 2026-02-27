'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import {
  getTrackingOverview,
  type TrackingOverview
} from '@/app/admin/tracking/actions'
import { useTrackingDateStore } from '@/store/adminTrackingStore'

import { OverviewCards } from './OverviewTab'

export const OverviewContainer = () => {
  const { startDate, endDate, queryVersion } = useTrackingDateStore()
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<TrackingOverview | null>(null)
  const initialLoaded = useRef(false)

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const { startISO, endISO } = useTrackingDateStore.getState().getQueryRange()
      const data = await getTrackingOverview(
        startISO || undefined,
        endISO || undefined
      )

      setOverview(data)
    } catch (error) {
      console.error('Failed to load overview data:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  // 初始加载
  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true
      loadData()
    }
  }, [loadData])

  // 监听查询版本变化（用户点击查询按钮）
  useEffect(() => {
    if (queryVersion > 0) {
      loadData()
    }
  }, [queryVersion, loadData])

  return (
    <OverviewCards
      data={overview}
      loading={loading}
      startDate={startDate}
      endDate={endDate}
    />
  )
}
