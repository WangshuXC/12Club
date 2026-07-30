'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import {
  getTrackingOverview,
  type TrackingOverview
} from '@/app/admin/tracking/actions'
import {
  useTrackingDateStore,
  type TrackingQueryRange
} from '@/store/adminTrackingStore'

import { OverviewCards } from './OverviewTab'

export const OverviewContainer = () => {
  const queryVersion = useTrackingDateStore((state) => state.queryVersion)
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<TrackingOverview | null>(null)
  const [range, setRange] = useState<TrackingQueryRange>(() =>
    useTrackingDateStore.getState().getQueryRange()
  )
  const initialLoaded = useRef(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const queryRange = useTrackingDateStore.getState().getQueryRange()

    try {
      const data = await getTrackingOverview(
        queryRange.startISO || undefined,
        queryRange.endISO || undefined
      )

      setOverview(data)
      setRange(queryRange)
    } catch (error) {
      console.error('Failed to load overview data:', error)
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

  // 监听查询版本变化（用户点击查询按钮）
  useEffect(() => {
    if (queryVersion > 0) {
      loadData()
    }
  }, [queryVersion, loadData])

  return <OverviewCards data={overview} loading={loading} range={range} />
}
