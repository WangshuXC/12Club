'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import {
  getAnimeStats,
  type AnimeStats,
  type PaginationInfo
} from '@/app/admin/tracking/anime/actions'
import { useTrackingDateStore } from '@/store/adminTrackingStore'

import { AnimeStatsTable } from './AnimeStatsTab'

export const AnimeStatsContainer = () => {
  const { startDate, endDate, queryVersion } = useTrackingDateStore()
  const [loading, setLoading] = useState(false)
  const [animeStats, setAnimeStats] = useState<AnimeStats[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const initialLoaded = useRef(false)

  const loadData = useCallback(
    async (page = 1) => {
      setLoading(true)

      try {
        const { startISO, endISO } = useTrackingDateStore.getState().getQueryRange()
        const data = await getAnimeStats(
          startISO || undefined,
          endISO || undefined,
          page,
          20
        )

        if (data) {
          setAnimeStats(data.list)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Failed to load anime stats:', error)
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
    <AnimeStatsTable
      data={animeStats}
      pagination={pagination}
      onPageChange={handlePageChange}
      loading={loading}
      startDate={startDate}
      endDate={endDate}
    />
  )
}
