'use client'

import { useState } from 'react'

import { Button, Tooltip, addToast } from '@heroui/react'
import { ThumbsUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPut } from '@/utils/fetch'

import type { ResourceComment } from '@/types/api/comment'

interface Props {
  comment: ResourceComment
}

export const CommentLikeButton = ({ comment }: Props) => {
  const { user } = useUserStore((state) => state)
  const [liked, setLiked] = useState(comment.isLike)
  const [likeCount, setLikeCount] = useState(comment.likeCount)
  const [loading, setLoading] = useState(false)

  const toggleLike = async () => {
    if (!user.uid) {
      addToast({
        title: '点赞失败',
        description: '请先登录后进行点赞',
        color: 'danger'
      })
      return
    }

    if (comment.userId === user.uid) {
      addToast({
        title: '点赞失败',
        description: '不能给自己点赞',
        color: 'danger'
      })
      return
    }

    setLoading(true)
    const res = await FetchPut<boolean>('/detail/comment/like', {
      commentId: comment.id
    })

    setLoading(false)
    ErrorHandler(res, (value) => {
      setLiked(value)
      setLikeCount((prev: number) => (value ? prev + 1 : prev - 1))
    })
  }

  return (
    <Tooltip key="like" color="default" content="点赞" placement="bottom">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        disabled={loading}
        isLoading={loading}
        onPress={toggleLike}
      >
        <ThumbsUp className={cn('w-4 h-4', liked ? 'text-danger-500' : '')} />
        {likeCount}
      </Button>
    </Tooltip>
  )
}
