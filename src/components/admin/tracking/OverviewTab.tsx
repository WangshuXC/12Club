'use client'

import { useState, useEffect, useMemo } from 'react'

import { Card, CardBody, Spinner } from '@heroui/react'

import {
  getTrendData,
  type TrackingOverview,
  type TrendType,
  type TrendDataPoint,
  type TrendGranularity
} from '@/app/admin/tracking/actions'
import { cn } from '@/lib/utils'
import { useTrackingDateStore } from '@/store/adminTrackingStore'

import { LineChart } from './LineChart'

interface OverviewCardsProps {
  data: TrackingOverview | null
  loading: boolean
  startDate?: string
  endDate?: string
}

// 概览统计卡片
export const OverviewCards = ({
  data,
  loading,
  startDate,
  endDate
}: OverviewCardsProps) => {
  const activeRange = useTrackingDateStore((s) => s.activeRange)
  const [selectedCard, setSelectedCard] = useState<TrendType | null>('visitors')
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [trendLoading, setTrendLoading] = useState(false)

  const granularity: TrendGranularity =
    activeRange === '24h' || activeRange === 'today' ? 'hour' : 'day'

  const cards = useMemo(
    () =>
      data
        ? [
            {
              title: '总访客数',
              value: data.totalVisitors,
              type: 'visitors' as TrendType
            },
            {
              title: '总事件数',
              value: data.totalEvents,
              type: 'events' as TrendType
            },
            {
              title: '访问页面数',
              value: data.uniquePages,
              type: 'pages' as TrendType
            },
            {
              title: '动漫播放次数',
              value: data.animePlayCount,
              type: 'plays' as TrendType
            }
          ]
        : [],
    [data]
  )

  // 获取趋势数据
  useEffect(() => {
    if (!selectedCard) {
      setTrendData([])
      return
    }

    const fetchTrend = async () => {
      setTrendLoading(true)
      const { startISO, endISO } =
        useTrackingDateStore.getState().getQueryRange()
      const result = await getTrendData(
        selectedCard,
        startISO || undefined,
        endISO || undefined,
        granularity
      )
      setTrendData(result || [])
      setTrendLoading(false)
    }

    fetchTrend()
  }, [selectedCard, startDate, endDate, granularity])

  // 日期范围变化时，保持选中第一个卡片
  useEffect(() => {
    setSelectedCard('visitors')
  }, [startDate, endDate])

  if (loading) return <Spinner />

  if (!data) {
    return (
      <div className="text-center py-8 text-default-500">
        暂无数据，请检查日期范围或稍后重试
      </div>
    )
  }

  const handleCardClick = (type: TrendType) => {
    if (selectedCard === type) {
      setSelectedCard(null)
    } else {
      setSelectedCard(type)
    }
  }

  const selectedCardInfo = cards.find((c) => c.type === selectedCard)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className={cn(
              'w-full cursor-pointer transition-all hover:scale-[1.02]',
              selectedCard === card.type && 'ring-2 ring-primary shadow-lg'
            )}
            isPressable
            onPress={() => handleCardClick(card.type)}
          >
            <CardBody className="flex flex-col justify-between">
              <p className="text-sm font-medium tracking-wide text-default-500">
                {card.title}
              </p>
              <p className="text-xl font-semibold text-default-700">
                {card.value.toLocaleString()}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 趋势图表 */}
      {selectedCard && (
        <Card className="w-full">
          <CardBody>
            <h3 className="text-lg font-semibold mb-4">
              {selectedCardInfo?.title}趋势
            </h3>
            <LineChart data={trendData} loading={trendLoading} />
          </CardBody>
        </Card>
      )}
    </div>
  )
}
