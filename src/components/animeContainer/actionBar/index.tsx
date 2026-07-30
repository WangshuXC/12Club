'use client'

import { addToast, useDisclosure } from '@heroui/react'
import {
  Star,
  MessageSquare,
  MessageCircleQuestion,
  Pencil
} from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Config } from '@/config/config'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { formatNumber } from '@/utils/formatNumber'

import { ActionButton } from './ActionButton'
import { FavoriteModal } from './FavoriteModal'
import { FeedbackModal } from './FeedbackModal'
import { SharePopover } from './SharePopover'

interface ActionBarProps {
  dbId: string
  title: string
  isFavorite: boolean
  stats: {
    comment: number
    favorited: number
  }
  onScrollToComment?: () => void
  coverImage: string
}

export const ActionBar = ({
  dbId,
  title,
  isFavorite,
  stats,
  onScrollToComment,
  coverImage
}: ActionBarProps) => {
  const pathName = usePathname()
  const { user } = useUserStore((state) => state)
  const isAdmin = user.role >= 2
  const { trackCustom } = useTrackingContext()

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
      addToast({ title: '请登录以收藏', color: 'danger' })
      return
    }

    trackCustom('favorite_open', { dbid: dbId })
    onFavoriteOpen()
  }

  const shareUrl = `${Config.url}${pathName}`

  return (
    <>
      {/* 操作按钮栏 */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 -mx-1 sm:-mx-3 bg-content rounded-lg">
        {/* 收藏按钮 */}
        <ActionButton
          icon={
            <Star
              fill={isFavorite ? '#f31260' : 'none'}
              className={cn(
                'size-5 sm:size-6',
                isFavorite && 'text-danger-500'
              )}
            />
          }
          label={formatNumber(stats.favorited)}
          tooltip={isFavorite ? '取消收藏' : '收藏'}
          isActive={isFavorite}
          onPress={handleFavorite}
        />

        <div className="h-4 w-px bg-default-300 hidden sm:block mx-1" />

        {/* 评论按钮 */}
        <ActionButton
          icon={<MessageSquare className="size-5 sm:size-6" />}
          label={formatNumber(stats.comment)}
          tooltip="查看评论"
          onPress={() => {
            trackCustom('comment_section_open', { dbid: dbId })
            onScrollToComment?.()
          }}
        />

        <div className="h-4 w-px bg-default-300 hidden sm:block mx-1" />

        {/* 分享按钮：PC hover 显示二维码/预览，移动端点击复制 */}
        <SharePopover
          shareUrl={shareUrl}
          title={title}
          coverImage={coverImage}
          onCopy={() => {
            trackCustom('share_copy', { dbid: dbId, method: 'link' })
            addToast({ title: '链接已复制', color: 'success' })
          }}
        />

        <div className="flex-1" />

        {/* 编辑按钮（仅管理员可见，新标签页打开） */}
        {isAdmin && (
          <ActionButton
            icon={<Pencil className="size-5 sm:size-6" />}
            label="编辑"
            tooltip="编辑资源"
            onPress={() =>
              window.open(
                `/admin/resource?query=${encodeURIComponent(dbId)}`,
                '_blank',
                'noopener,noreferrer'
              )
            }
          />
        )}

        {/* 反馈按钮 */}
        <ActionButton
          icon={<MessageCircleQuestion className="size-5 sm:size-6" />}
          label="反馈"
          tooltip="资源反馈"
          onPress={() => {
            trackCustom('feedback_open', { dbid: dbId })
            onFeedbackOpen()
          }}
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
