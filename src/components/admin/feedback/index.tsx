'use client'

import { useEffect, useState } from 'react'

import { Loading } from '@/components/common/Loading'
import { Null } from '@/components/common/Null'
import { SelfPagination } from '@/components/common/Pagination'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { FeedbackCard } from './FeedbackCard'

import type { AdminFeedback } from '@/types/api/admin'

interface Props {
  initialFeedbacks: AdminFeedback[]
  total: number
}

export const Feedback = ({ initialFeedbacks, total }: Props) => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>(initialFeedbacks)
  const [page, setPage] = useState(1)
  const isMounted = useMounted()

  const [loading, setLoading] = useState(false)
  const fetchData = async () => {
    setLoading(true)

    const { feedbacks } = await FetchGet<{
      feedbacks: AdminFeedback[]
      total: number
    }>('/admin/feedback', {
      page,
      limit: 30
    })

    setLoading(false)
    setFeedbacks(feedbacks)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">资源反馈管理</h1>

      <div className="space-y-4">
        {loading ? (
          <Loading hint="正在获取反馈数据..." />
        ) : (
          <>
            {feedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </>
        )}
      </div>

      {feedbacks.length === 0 && <Null message="暂无反馈数据" />}

      <div className="flex justify-center">
        {Math.ceil(total / 30) > 1 && (
          <SelfPagination
            total={Math.ceil(total / 30)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  )
}
