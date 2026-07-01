'use client'

import { useEffect, useState, useTransition } from 'react'

import {
  getActions,
  type PlayHistoryItem
} from '@/app/user/[id]/history/actions'
import { Loading } from '@/components/common/Loading'
import { Null } from '@/components/common/Null'
import { SelfPagination } from '@/components/common/Pagination'

import { PlayHistoryCard } from './Card'

interface Props {
  history: PlayHistoryItem[]
  total: number
  uid: number
}

export const UserPlayHistory = ({ history, total, uid }: Props) => {
  const [items, setItems] = useState<PlayHistoryItem[]>(history)
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (page === 1) {
      setItems(history)
      return
    }

    startTransition(async () => {
      const response = await getActions({ uid, page, limit: 10 })
      if (typeof response !== 'string') {
        setItems(response.history)
      }
    })
  }, [uid, page, history])

  return (
    <div className="space-y-4">
      {isPending ? (
        <Loading hint="正在获取播放历史..." />
      ) : (
        <>
          {items.map((item) => (
            <PlayHistoryCard
              key={`${item.dbId}-${item.accordion}`}
              item={item}
            />
          ))}
        </>
      )}

      {!total && <Null message="还没有播放记录哦" />}

      {total > 10 && (
        <div className="flex justify-center">
          <SelfPagination
            total={Math.ceil(total / 10)}
            page={page}
            onPageChange={setPage}
            isLoading={isPending}
          />
        </div>
      )}
    </div>
  )
}
