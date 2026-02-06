'use client'

import { useEffect, useState } from 'react'

import { Input } from '@heroui/react'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { Loading } from '@/components/common/Loading'
import { SelfPagination } from '@/components/common/Pagination'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { CommentCard } from './Card'

import type { AdminComment } from '@/types/api/admin'

interface Props {
  initialComments: AdminComment[]
  initialTotal: number
}

export const Comment = ({ initialComments, initialTotal }: Props) => {
  const [comments, setComments] = useState<AdminComment[]>(initialComments)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const isMounted = useMounted()

  const [loading, setLoading] = useState(false)
  const fetchData = async () => {
    setLoading(true)

    const { comments, total } = await FetchGet<{
      comments: AdminComment[]
      total: number
    }>('/admin/comment', {
      page,
      limit: 30,
      search: debouncedQuery
    })

    setLoading(false)
    setComments(comments)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page, debouncedQuery])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  // 删除评论的回调函数
  const handleDeleteComment = (commentId: number) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== commentId))
    setTotal(prevTotal => prevTotal - 1)
  }

  // 更新评论的回调函数
  const handleUpdateComment = (commentId: number, newContent: string) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, content: newContent }
          : comment
      )
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">评论管理</h1>

      <Input
        fullWidth
        isClearable
        placeholder="输入评论内容或用户名搜索评论..."
        startContent={<Search className="text-default-300" size={20} />}
        value={searchQuery}
        onValueChange={handleSearch}
      />

      <div className="space-y-4">
        {loading ? (
          <Loading hint="正在获取评论数据..." />
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
              />
            ))}
          </>
        )}
      </div>

      <div className="flex justify-center">
        {Math.ceil(total / 30) > 1 && <SelfPagination
          page={page}
          total={Math.ceil(total / 30)}
          onPageChange={(newPage) => setPage(newPage)}
          isLoading={loading}
        />}
      </div>
    </div>
  )
}
