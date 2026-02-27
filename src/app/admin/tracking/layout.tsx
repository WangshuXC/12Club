'use client'

import { Button, Tab, Tabs } from '@heroui/react'
import { usePathname } from 'next/navigation'

import {
  useTrackingDateStore,
  type QuickRangeType
} from '@/store/adminTrackingStore'

const tabs = [
  { key: '/admin/tracking', title: '概览' },
  { key: '/admin/tracking/pages', title: '页面访问' },
  { key: '/admin/tracking/anime', title: '动漫播放' },
  { key: '/admin/tracking/visitors', title: '访客列表' }
]

export default function TrackingLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const {
    startDate,
    endDate,
    activeRange,
    setStartDate,
    setEndDate,
    triggerQuery,
    setQuickRange,
    setLast24h,
    setToday
  } = useTrackingDateStore()

  const rangeButton = (
    label: string,
    range: QuickRangeType,
    onPress: () => void
  ) => (
    <Button
      size="sm"
      variant={activeRange === range ? 'solid' : 'flat'}
      color={activeRange === range ? 'primary' : 'default'}
      onPress={onPress}
    >
      {label}
    </Button>
  )

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">埋点统计</h1>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div className="flex gap-2">
          {rangeButton('最近24小时', '24h', setLast24h)}
          {rangeButton('当天', 'today', setToday)}
          {rangeButton('近7天', '7d', () => setQuickRange(7))}
          {rangeButton('近30天', '30d', () => setQuickRange(30))}
          {rangeButton('近90天', '90d', () => setQuickRange(90))}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-default-200 bg-default-100 text-sm"
          />
          <span className="text-default-500">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-default-200 bg-default-100 text-sm"
          />
        </div>

        <Button color="primary" size="sm" onPress={triggerQuery}>
          查询
        </Button>
      </div>

      <Tabs
        selectedKey={pathname}
        aria-label="统计类型"
        className="mb-4"
        items={tabs}
      >
        {(tab) => <Tab key={tab.key} title={tab.title} href={tab.key} />}
      </Tabs>

      {children}
    </div>
  )
}
