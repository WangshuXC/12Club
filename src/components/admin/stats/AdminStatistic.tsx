'use client'

import { FC, useEffect, useState } from 'react'
import { Slider, Divider } from '@heroui/react'
import { useDebounce } from 'use-debounce'
import { TrendingUp } from 'lucide-react'
import { AdminSum } from './AdminSum'
import { AdminWebSites } from './AdminWebSites'
import { FetchGet } from '@/utils/fetch'
import { StatsCard } from './StatsCard'
import { ErrorHandler } from '@/utils/errorHandler'
import { ADMIN_STATS_MAP } from '@/constants/admin'
import type { OverviewData, AdminNotificationData } from '@/types/api/admin'
import { AdminNotification } from '@/components/admin/notice/AdminNotification'

export const AdminStatistic: FC = () => {
  const [overview, setOverview] = useState<OverviewData>({
    newUser: 0,
    newActiveUser: 0,
    newResource: 0,
    newResourcePatch: 0,
    newComment: 0
  })
  const [notifications, setNotifications] = useState<AdminNotificationData>({
    passwordResets: 0,
    feedbacks: 0,
    reports: 0,
    total: 0
  })
  const [days, setDays] = useState(1)
  const [debouncedDays] = useDebounce(days, 300)

  const fetchNotifications = async () => {
    const res = await FetchGet<AdminNotificationData>('/admin/stats/notice')
    ErrorHandler(res, setNotifications)
  }

  const fetchOverview = async (days: number) => {
    const res = await FetchGet<OverviewData>('/admin/stats', {
      days
    })
    ErrorHandler(res, setOverview)
  }

  useEffect(() => {
    fetchOverview(debouncedDays)
  }, [debouncedDays])

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="space-y-8">
      <AdminWebSites />

      {notifications.total > 0 && (
        <>
          <Divider />
          <AdminNotification notifications={notifications} />
        </>
      )}

      <Divider />

      <AdminSum />

      <div className="flex flex-col space-y-6">
        <h3 className="text-lg font-semibold whitespace-nowrap flex items-center gap-2">
          <TrendingUp size={20} className="hidden 2xl:block" />
          {`${days} 天内数据统计`}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {Object.entries(ADMIN_STATS_MAP).map(([key, title]) => (
            <StatsCard
              key={key}
              title={title}
              value={overview[key as keyof OverviewData]}
            />
          ))}
        </div>

        <div className="flex-grow w-full">
          <Slider
            label="设置天数"
            step={1}
            minValue={1}
            maxValue={60}
            value={days}
            onChange={(value) => setDays(Number(value))}
          />
        </div>
      </div>
    </div>
  )
}
