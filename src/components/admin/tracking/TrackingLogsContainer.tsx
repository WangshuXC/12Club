'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getTrackingLogs,
  type TrackingLogItem,
  type TrackingLogPaginationInfo
} from '@/app/admin/tracking/logs/actions'
import {
  useTrackingDateStore,
  type TrackingQueryRange
} from '@/store/adminTrackingStore'

import { TrackingLogsTable } from './TrackingLogsTable'

const PAGE_SIZE = 50

export const TrackingLogsContainer = () => {
  const queryVersion = useTrackingDateStore((state) => state.queryVersion)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<TrackingLogItem[]>([])
  const [pagination, setPagination] =
    useState<TrackingLogPaginationInfo | null>(null)
  const [range, setRange] = useState<TrackingQueryRange>(() =>
    useTrackingDateStore.getState().getQueryRange()
  )
  const initialLoaded = useRef(false)

  const loadData = useCallback(async (page = 1) => {
    setLoading(true)
    const queryRange = useTrackingDateStore.getState().getQueryRange()

    try {
      const data = await getTrackingLogs(
        queryRange.startISO || undefined,
        queryRange.endISO || undefined,
        page,
        PAGE_SIZE
      )

      if (data) {
        setLogs(data.list)
        setPagination(data.pagination)
        setRange(queryRange)
      }
    } catch (error) {
      console.error('Failed to load tracking logs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialLoaded.current) {
      initialLoaded.current = true
      loadData()
    }
  }, [loadData])

  useEffect(() => {
    if (queryVersion > 0) {
      loadData(1)
    }
  }, [loadData, queryVersion])

  return (
    <TrackingLogsTable
      data={logs}
      loading={loading}
      pagination={pagination}
      range={range}
      onPageChange={loadData}
    />
  )
}
