'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, Tab } from '@heroui/react'
import {
  getTrackingOverview,
  getPageStats,
  getAnimeStats,
  getVisitorStats,
  type TrackingOverview,
  type PageStats,
  type AnimeStats,
  type VisitorStats,
  type PaginationInfo
} from '@/app/admin/tracking/actions'

// 拆分后的子组件
import { DateRangeSelector } from './DateRangeSelector'
import { OverviewCards } from './OverviewTab'
import { PageStatsTable } from './PageStatsTab'
import { AnimeStatsTable } from './AnimeStatsTab'
import { VisitorStatsTable } from './VisitorStatsTab'

// 主组件
export const TrackingStatsContainer = () => {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  // 各类数据状态
  const [overview, setOverview] = useState<TrackingOverview | null>(null)
  const [pageStats, setPageStats] = useState<PageStats[]>([])
  const [pagePagination, setPagePagination] = useState<PaginationInfo | null>(
    null
  )
  const [animeStats, setAnimeStats] = useState<AnimeStats[]>([])
  const [animePagination, setAnimePagination] = useState<PaginationInfo | null>(
    null
  )
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([])
  const [visitorPagination, setVisitorPagination] =
    useState<PaginationInfo | null>(null)

  // 加载数据
  const loadData = useCallback(
    async (tab?: string) => {
      const currentTab = tab || selectedTab
      setLoading(true)
      try {
        const start = startDate
          ? new Date(startDate).toISOString()
          : undefined
        const end = endDate
          ? new Date(endDate + 'T23:59:59').toISOString()
          : undefined

        switch (currentTab) {
          case 'overview': {
            const data = await getTrackingOverview(start, end)
            setOverview(data)
            break
          }
          case 'pages': {
            const data = await getPageStats(start, end, 1, 20)
            if (data) {
              setPageStats(data.list)
              setPagePagination(data.pagination)
            }
            break
          }
          case 'anime': {
            const data = await getAnimeStats(start, end, 1, 20)
            if (data) {
              setAnimeStats(data.list)
              setAnimePagination(data.pagination)
            }
            break
          }
          case 'visitors': {
            const data = await getVisitorStats(start, end, 1, 20)
            if (data) {
              setVisitorStats(data.list)
              setVisitorPagination(data.pagination)
            }
            break
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    },
    [selectedTab, startDate, endDate]
  )

  // 初始化日期范围并加载数据（默认近30天）
  useEffect(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    setStartDate(startStr)
    setEndDate(endStr)

    // 初始化完成后立即加载数据
    const loadInitialData = async () => {
      setLoading(true)
      try {
        const startISO = new Date(startStr).toISOString()
        const endISO = new Date(endStr + 'T23:59:59').toISOString()
        const data = await getTrackingOverview(startISO, endISO)
        setOverview(data)
      } catch (error) {
        console.error('Failed to load initial data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Tab 切换时加载数据
  const handleTabChange = (key: string) => {
    setSelectedTab(key)
    if (startDate && endDate) {
      loadData(key)
    }
  }

  // 页面统计分页
  const handlePageStatsPageChange = async (page: number) => {
    setLoading(true)
    try {
      const start = startDate ? new Date(startDate).toISOString() : undefined
      const end = endDate
        ? new Date(endDate + 'T23:59:59').toISOString()
        : undefined
      const data = await getPageStats(start, end, page, 20)
      if (data) {
        setPageStats(data.list)
        setPagePagination(data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  // 动漫统计分页
  const handleAnimeStatsPageChange = async (page: number) => {
    setLoading(true)
    try {
      const start = startDate ? new Date(startDate).toISOString() : undefined
      const end = endDate
        ? new Date(endDate + 'T23:59:59').toISOString()
        : undefined
      const data = await getAnimeStats(start, end, page, 20)
      if (data) {
        setAnimeStats(data.list)
        setAnimePagination(data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  // 访客统计分页
  const handleVisitorStatsPageChange = async (page: number) => {
    setLoading(true)
    try {
      const start = startDate ? new Date(startDate).toISOString() : undefined
      const end = endDate
        ? new Date(endDate + 'T23:59:59').toISOString()
        : undefined
      const data = await getVisitorStats(start, end, page, 20)
      if (data) {
        setVisitorStats(data.list)
        setVisitorPagination(data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">埋点统计</h1>

      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={() => loadData()}
      />

      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => handleTabChange(key as string)}
        aria-label="统计类型"
        className="mb-4"
      >
        <Tab key="overview" title="概览">
          <OverviewCards
            data={overview}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          />
        </Tab>
        <Tab key="pages" title="页面访问">
          <PageStatsTable
            data={pageStats}
            pagination={pagePagination}
            onPageChange={handlePageStatsPageChange}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          />
        </Tab>
        <Tab key="anime" title="动漫播放">
          <AnimeStatsTable
            data={animeStats}
            pagination={animePagination}
            onPageChange={handleAnimeStatsPageChange}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          />
        </Tab>
        <Tab key="visitors" title="访客列表">
          <VisitorStatsTable
            data={visitorStats}
            pagination={visitorPagination}
            onPageChange={handleVisitorStatsPageChange}
            loading={loading}
          />
        </Tab>
      </Tabs>
    </div>
  )
}
