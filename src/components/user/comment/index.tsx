'use client'

import { useEffect, useState } from 'react'

import { Loading } from '@/components/common/Loading'
import { Null } from '@/components/common/Null'
import { SelfPagination } from '@/components/common/Pagination'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { UserCommentCard } from './Card'

import type { UserComment as UserCommentType } from '@/types/api/user'

interface Props {
  initComments: UserCommentType[]
  total: number
  uid: number
}

export const UserComment = ({ initComments, total, uid }: Props) => {
  const isMounted = useMounted()
  const [comments, setComments] = useState<UserCommentType[]>(initComments)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    const { comments } = await FetchGet<{
      comments: UserCommentType[]
      total: number
    }>('/user/profile/comment', {
      uid,
      page,
      limit: 20
    })

    setComments(comments)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page])

  return (
    <div className="space-y-4">
      {loading ? (
        <Loading hint="正在获取评论数据..." />
      ) : (
        <>
          {comments.map((com) => (
            <UserCommentCard key={com.id} comment={com} />
          ))}
        </>
      )}

      {!total && <Null message="还没有发布过评论哦" />}

      {total > 20 && (
        <div className="flex justify-center">
          <SelfPagination
            total={Math.ceil(total / 20)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
