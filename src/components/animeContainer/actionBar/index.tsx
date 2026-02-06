'use client'

import { useDisclosure } from '@heroui/react'
import { Star, Share2, MessageSquare, MessageCircleQuestion } from 'lucide-react'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

import { Config } from '@/config/config'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { Copy } from '@/utils/copy'
import { formatNumber } from '@/utils/formatNumber'

import { ActionButton } from './ActionButton'
import { FavoriteModal } from './FavoriteModal'
import { FeedbackModal } from './FeedbackModal'

interface ActionBarProps {
  dbId: string
  title: string
  isFavorite: boolean
  stats: {
    comment: number
    favorited: number
  }
  onScrollToComment?: () => void
}

export const ActionBar = ({
  dbId,
  title,
  isFavorite,
  stats,
  onScrollToComment
}: ActionBarProps) => {
  const pathName = usePathname()
  const { user } = useUserStore((state) => state)

  // 收藏弹窗状态
  const {
    isOpen: isFavoriteOpen,
    onOpen: onFavoriteOpen,
    onClose: onFavoriteClose
  } = useDisclosure()

  // 反馈弹窗状态
  const {
    isOpen: isFeedbackOpen,
    onOpen: onFeedbackOpen,
    onClose: onFeedbackClose
  } = useDisclosure()

  // 收藏逻辑
  const handleFavorite = () => {
    if (!user.uid) {
      toast.error('请登录以收藏')
      return
    }

    onFavoriteOpen()
  }

  // 分享逻辑
  const handleShare = () => {
    const text = `${title} - ${Config.url}${pathName}`
    Copy(text)
  }

  return (
    <>
      {/* 操作按钮栏 */}
      <div className="flex flex-wrap items-center gap-2 -mx-3 bg-content1 rounded-lg">
        {/* 收藏按钮 */}
        <ActionButton
          icon={
            <Star
              fill={isFavorite ? '#f31260' : 'none'}
              className={cn('size-6', isFavorite && 'text-danger-500')}
            />
          }
          label={formatNumber(stats.favorited)}
          tooltip={isFavorite ? '取消收藏' : '收藏'}
          isActive={isFavorite}
          onPress={handleFavorite}
        />

        <div className="h-4 w-px bg-default-300 mx-1" />

        {/* 评论按钮 */}
        <ActionButton
          icon={<MessageSquare className="size-6" />}
          label={formatNumber(stats.comment)}
          tooltip="查看评论"
          onPress={onScrollToComment}
        />

        <div className="h-4 w-px bg-default-300 mx-1" />

        {/* 分享按钮 */}
        <ActionButton
          icon={<Share2 className="size-6" />}
          label="分享"
          tooltip="复制分享链接"
          onPress={handleShare}
        />

        <div className="flex-1" />

        {/* 反馈按钮 */}
        <ActionButton
          icon={<MessageCircleQuestion className="size-6" />}
          label="反馈"
          tooltip="资源反馈"
          onPress={onFeedbackOpen}
        />
      </div>

      {/* 收藏弹窗 */}
      <FavoriteModal
        dbId={dbId}
        isOpen={isFavoriteOpen}
        onClose={onFavoriteClose}
      />

      {/* 反馈弹窗 */}
      <FeedbackModal
        dbId={dbId}
        title={title}
        isOpen={isFeedbackOpen}
        onClose={onFeedbackClose}
      />
    </>
  )
}
