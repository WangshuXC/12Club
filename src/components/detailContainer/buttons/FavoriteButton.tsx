'use client'

import { addToast, Button, Tooltip, useDisclosure } from '@heroui/react'
import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { useUserStore } from '@/store/userStore'

import { FavoriteModal } from './FavoriteModal'

interface Props {
  dbId: string
  isFavorite: boolean
}

export const FavoriteButton = ({ dbId, isFavorite }: Props) => {
  const { user } = useUserStore((state) => state)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { trackCustom } = useTrackingContext()

  const toggleLike = async () => {
    if (!user.uid) {
      addToast({ title: '请登录以收藏', color: 'danger' })
      return
    }

    trackCustom('favorite_open', { dbid: dbId })
    onOpen()
  }

  return (
    <>
      <Tooltip key="favorite" content={isFavorite ? '取消收藏' : '收藏'}>
        <Button
          isIconOnly
          color={isFavorite ? 'danger' : 'default'}
          variant={isFavorite ? 'flat' : 'bordered'}
          onPress={toggleLike}
          aria-label={isFavorite ? '取消收藏' : '收藏'}
          className="min-w-0 px-2"
        >
          <Heart
            fill={isFavorite ? '#f31260' : 'none'}
            className={cn('size-4', isFavorite ? 'text-danger-500' : '')}
          />
        </Button>
      </Tooltip>

      <FavoriteModal dbId={dbId} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
