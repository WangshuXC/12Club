'use client'

import { useEffect, useState } from 'react'

import { Skeleton } from '@heroui/react'

import { SelfPagination } from '@/components/common/Pagination'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchGet } from '@/utils/fetch'

import { MessageItem } from './MessageItem'

import type {
  Message,
  MessageCategory,
  MessageListResponse
} from '@/types/api/message'

interface Props {
  category: MessageCategory
}

const PAGE_SIZE = 20

export const MessageList = ({ category }: Props) => {
  const [page, setPage] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // category 变化时重置分页与列表，避免切 Tab 闪现旧数据
  useEffect(() => {
    setPage(1)
    setMessages([])
    setTotal(0)
  }, [category])

  useEffect(() => {
    let canceled = false
    setLoading(true)

    FetchGet<MessageListResponse>('/message/list', {
      category,
      page: String(page),
      limit: String(PAGE_SIZE)
    }).then((res) => {
      if (canceled) return
      setLoading(false)

      ErrorHandler(res, (data) => {
        if (data?.messages) {
          setMessages(data.messages)
          setTotal(data.total)
        } else {
          setMessages([])
          setTotal(0)
        }
      })
    })

    return () => {
      canceled = true
    }
  }, [category, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full rounded-lg">
              <div className="h-24 rounded-lg bg-default-200" />
            </Skeleton>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-default-500">暂无消息</div>
      ) : (
        <>
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageItem key={m.id} message={m} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <SelfPagination
                total={totalPages}
                page={page}
                onPageChange={setPage}
                isLoading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
