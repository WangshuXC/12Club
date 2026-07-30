'use client'

import { useEffect, useMemo, useState } from 'react'

import { Card, CardBody, Chip, Spinner } from '@heroui/react'
import dynamic from 'next/dynamic'
import { Play, Users, UserPlus, View } from 'lucide-react'

import {
  getTrendData,
  type TrackingOverview,
  type TrendDataPoint,
  type TrendGranularity,
  type TrendType
} from '@/app/admin/tracking/actions'
import type { TrackingQueryRange } from '@/store/adminTrackingStore'
import { cn } from '@/lib/utils'

const LineChart = dynamic(
  () => import('./LineChart').then((module) => module.LineChart),
  {
    ssr: false,
    loading: () => <div className="h-64" />
  }
)

const DonutChart = dynamic(
  () => import('./DonutChart').then((module) => module.DonutChart),
  {
    ssr: false,
    loading: () => <div className="h-52" />
  }
)

interface OverviewCardsProps {
  data: TrackingOverview | null
  loading: boolean
  range: TrackingQueryRange
}

const formatNumber = (value: number) => value.toLocaleString('zh-CN')

const formatRatio = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    maximumFractionDigits: 1
  }).format(value)

const getChange = (value: number, previousValue: number) => {
  if (previousValue === 0) {
    return value === 0 ? '与上期持平' : '上期无数据'
  }

  const change = (value - previousValue) / previousValue
  const prefix = change > 0 ? '+' : ''

  return `较上期 ${prefix}${formatRatio(change)}`
}

const ListDistributionCard = ({
  title,
  items,
  emptyLabel = '暂无数据'
}: {
  title: string
  items: Array<{ label: string; count: number }>
  emptyLabel?: string
}) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="min-w-0">
      <CardBody className="gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-default-500">
            {emptyLabel}
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const percent = item.count / total

              return (
                <div key={item.label} className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate" title={item.label}>
                      {item.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-default-500">
                      {formatNumber(item.count)} · {formatRatio(percent)}
                    </span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-default-100"
                    aria-label={`${item.label} 占比 ${formatRatio(percent)}`}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(percent * 100, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

const DonutDistributionCard = ({
  title,
  items,
  dataLabel
}: {
  title: string
  items: Array<{ label: string; count: number }>
  dataLabel: string
}) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="min-w-0">
      <CardBody className="gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-default-500">暂无数据</p>
        ) : (
          <>
            <DonutChart data={items} dataLabel={dataLabel} />
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 justify-between gap-2 text-sm"
                >
                  <span className="truncate" title={item.label}>
                    {item.label}
                  </span>
                  <span className="shrink-0 tabular-nums text-default-500">
                    {formatRatio(item.count / total)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}

// 健康度、趋势和流量诊断的统一概览看板。
export const OverviewCards = ({ data, loading, range }: OverviewCardsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<TrendType>('visitors')
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [trendLoading, setTrendLoading] = useState(false)

  const duration =
    new Date(range.endISO).getTime() - new Date(range.startISO).getTime()
  const granularity: TrendGranularity =
    duration <= 24 * 60 * 60 * 1000 ? 'hour' : 'day'

  useEffect(() => {
    let cancelled = false

    const loadTrend = async () => {
      setTrendLoading(true)
      const result = await getTrendData(
        selectedMetric,
        range.startISO,
        range.endISO,
        granularity
      )

      if (!cancelled) {
        setTrendData(result || [])
        setTrendLoading(false)
      }
    }

    loadTrend()

    return () => {
      cancelled = true
    }
  }, [granularity, range.endISO, range.startISO, selectedMetric])

  const cards = useMemo(() => {
    if (!data) return []

    const { summary, previousSummary } = data

    return [
      {
        title: '活跃访客',
        value: formatNumber(summary.activeVisitors),
        change: getChange(
          summary.activeVisitors,
          previousSummary.activeVisitors
        ),
        description: '本期产生页面访问的去重访客',
        type: 'visitors' as TrendType,
        icon: Users
      },
      {
        title: '新增访客',
        value: formatNumber(summary.newVisitors),
        change: getChange(summary.newVisitors, previousSummary.newVisitors),
        description: '首次被识别的访客',
        type: 'newVisitors' as TrendType,
        icon: UserPlus
      },
      {
        title: '页面浏览',
        value: formatNumber(summary.pageViews),
        change: getChange(summary.pageViews, previousSummary.pageViews),
        description: `${formatNumber(data.uniquePages)} 个去重页面`,
        type: 'pageViews' as TrendType,
        icon: View
      }
    ]
  }, [data])

  if (loading && !data) return <Spinner className="mt-10 w-full" />

  if (!data) {
    return (
      <div className="py-8 text-center text-default-500">
        暂无数据，请调整日期范围后重试。
      </div>
    )
  }

  const selectedCardTitle =
    selectedMetric === 'plays'
      ? '播放表现'
      : cards.find((card) => card.type === selectedMetric)?.title
  const pageViewsPerVisitor =
    data.summary.activeVisitors === 0
      ? 0
      : data.summary.pageViews / data.summary.activeVisitors

  return (
    <div
      className={cn('space-y-5', loading && 'opacity-60')}
      aria-busy={loading}
    >
      <section aria-label="核心指标">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon
            const isSelected = selectedMetric === card.type

            return (
              <Card
                key={card.title}
                isPressable
                aria-label={`查看${card.title}趋势`}
                className={cn(
                  'min-w-0 transition-transform motion-reduce:transition-none',
                  'hover:-translate-y-0.5',
                  isSelected && 'ring-2 ring-primary shadow-md'
                )}
                onPress={() => setSelectedMetric(card.type)}
              >
                <CardBody className="gap-2">
                  <div className="flex items-center justify-between gap-2 text-default-500">
                    <p className="text-sm font-medium">{card.title}</p>
                    <Icon aria-hidden="true" className="size-4" />
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {card.value}
                  </p>
                  <p className="text-xs text-default-500">{card.change}</p>
                  <p className="min-h-4 text-xs text-default-400">
                    {card.description}
                  </p>
                </CardBody>
              </Card>
            )
          })}
          <Card
            isPressable
            aria-label="查看播放表现趋势"
            className={cn(
              'min-w-0 sm:col-span-2 transition-transform motion-reduce:transition-none',
              'hover:-translate-y-0.5',
              selectedMetric === 'plays' && 'ring-2 ring-primary shadow-md'
            )}
            onPress={() => setSelectedMetric('plays')}
          >
            <CardBody className="gap-3">
              <div className="flex items-center justify-between gap-2 text-default-500">
                <p className="text-sm font-medium">播放表现</p>
                <Play aria-hidden="true" className="size-4" />
              </div>
              <div className="grid grid-cols-2 divide-x divide-default-200">
                <div className="pr-4">
                  <p className="text-sm text-default-500">播放访客</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatNumber(data.summary.playVisitors)}
                  </p>
                  <p className="mt-1 text-xs text-default-500">
                    {getChange(
                      data.summary.playVisitors,
                      data.previousSummary.playVisitors
                    )}
                  </p>
                </div>
                <div className="pl-4">
                  <p className="text-sm text-default-500">播放转化</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatRatio(
                      data.summary.activeVisitors === 0
                        ? 0
                        : data.summary.playVisitors /
                            data.summary.activeVisitors
                    )}
                  </p>
                  <p className="mt-1 text-xs text-default-500">
                    {getChange(
                      data.summary.activeVisitors === 0
                        ? 0
                        : data.summary.playVisitors /
                            data.summary.activeVisitors,
                      data.previousSummary.activeVisitors === 0
                        ? 0
                        : data.previousSummary.playVisitors /
                            data.previousSummary.activeVisitors
                    )}
                  </p>
                </div>
              </div>
              <p className="text-xs text-default-400">
                {formatNumber(data.summary.animePlayCount)} 次播放 · 播放访客 ÷
                活跃访客
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section aria-label="趋势与效率" className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardBody>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedCardTitle}趋势
                </h2>
                <p className="text-sm text-default-500">
                  与上一等长周期进行比较
                </p>
              </div>
              <Chip size="sm" variant="flat" color="primary">
                {granularity === 'hour' ? '按小时' : '按天'}
              </Chip>
            </div>
            <LineChart data={trendData} loading={trendLoading} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="gap-4">
            <h2 className="text-base font-semibold">运营速览</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-default-500">平均浏览深度</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatNumber(pageViewsPerVisitor)}
                  <span className="ml-1 text-sm font-normal text-default-500">
                    页 / 活跃访客
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-default-500">活跃会话</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatNumber(data.summary.sessions)}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-500">埋点事件</p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatNumber(data.totalEvents)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section aria-label="流量诊断" className="grid gap-5 lg:grid-cols-3">
        <DonutDistributionCard
          title="设备分布"
          dataLabel="设备类型"
          items={data.deviceStats.map((item) => ({
            label: item.device,
            count: item.count
          }))}
        />
        <DonutDistributionCard
          title="访问来源"
          dataLabel="访问来源"
          items={data.sourceStats.map((item) => ({
            label: item.source,
            count: item.count
          }))}
        />
        <ListDistributionCard
          title="关键事件"
          items={data.eventTypeStats.map((item) => ({
            label: item.type,
            count: item.count
          }))}
        />
      </section>
    </div>
  )
}
