'use client'

import { FC, useEffect, useState } from 'react'

import { BarChart3 } from 'lucide-react'

import { ADMIN_STATS_SUM_MAP } from '@/constants/admin'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchGet } from '@/utils/fetch'

import { StatsCard } from './StatsCard'

import type { SumData } from '@/types/api/admin'

export const AdminSum: FC = () => {
  const [sum, setSum] = useState<SumData>({
    userCount: 0,
    resourceCount: 0,
    resourcePatchCount: 0,
    commentCount: 0
  })

  const fetchSummaryData = async () => {
    const res = await FetchGet<SumData>('/admin/stats/sum')
    ErrorHandler(res, setSum)
  }

  useEffect(() => {
    fetchSummaryData()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 size={24} className="hidden 2xl:block" />
        数据统计
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
        {Object.entries(ADMIN_STATS_SUM_MAP).map(([key, title]) => (
          <StatsCard
            key={key}
            title={title}
            value={sum[key as keyof SumData]}
          />
        ))}
      </div>
    </div>
  )
}
