'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import type { SortDescriptor } from '@heroui/react'

import {
  getAnimeStats,
  type AnimeStats,
  type PaginationInfo
} from '@/app/admin/tracking/anime/actions'
import {
  useTrackingDateStore,
  type TrackingQueryRange
} from '@/store/adminTrackingStore'

import { AnimeStatsTable } from './AnimeStatsTab'

const DEFAULT_SORT_DESCRIPTOR: SortDescriptor = {
  column: 'playCount',
  direction: 'descending'
}

export const AnimeStatsContainer = () => {
  const queryVersion = useTrackingDateStore((state) => state.queryVersion)
  const [loading, setLoading] = useState(false)
  const [animeStats, setAnimeStats] = useState<AnimeStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [range, setRange] = useState<TrackingQueryRange>(() =>
    useTrackingDateStore.getState().getQueryRange()
  )
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(
    DEFAULT_SORT_DESCRIPTOR
  )
  const sortDescriptorRef = useRef<SortDescriptor>(DEFAULT_SORT_DESCRIPTOR)
  const initialLoaded = useRef(false)

  const loadData = useCallback(
    async (page = 1, requestedSort = DEFAULT_SORT_DESCRIPTOR) => {
      setLoading(true)
      const queryRange = useTrackingDateStore.getState().getQueryRange()

      try {
        const data = await getAnimeStats(
          queryRange.startISO || undefined,
          queryRange.endISO || undefined,
          page,
          20,
          requestedSort.column as
            | 'name'
            | 'playCount'
            | 'uniqueVisitors'
            | 'episodes',
          requestedSort.direction === 'ascending' ? 'ascending' : 'descending'
        )

        if (data) {
          setAnimeStats(data.list)
          setPagination(data.pagination)
          setRange(queryRange)
        }
      } catch (error) {
        console.error('Failed to load anime stats:', error)
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
      loadData()
    }
  }, [loadData])

  // 监听查询版本变化
  useEffect(() => {
    if (queryVersion > 0) {
      loadData(1, sortDescriptorRef.current)
    }
  }, [queryVersion, loadData])

  const handlePageChange = (page: number) => {
    loadData(page, sortDescriptor)
  }

  const handleSortChange = (nextSort: SortDescriptor) => {
    sortDescriptorRef.current = nextSort
    setSortDescriptor(nextSort)
    loadData(1, nextSort)
  }

  return (
    <AnimeStatsTable
      data={animeStats}
      pagination={pagination}
      onPageChange={handlePageChange}
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
      loading={loading}
      range={range}
    />
  )
}
