'use client'
import { Tooltip, Button } from '@heroui/react'
import { Download, Pencil } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'

import { useUserStore } from '@/store/userStore'

import { FavoriteButton } from './buttons/FavoriteButton'
import { FeedbackButton } from './buttons/FeedbackButton'
import { ShareButton } from './buttons/ShareButton'

import type { PlayListItem } from '@/types/common/detail-container'

// 在线阅读器依赖浏览器环境（foliate-js Web Component），仅客户端加载
const ReaderEntry = dynamic(
  () => import('./reader').then((m) => m.ReaderEntry),
  { ssr: false }
)

interface Props {
  name: string
  dbId: string
  isFavorite: boolean
  handleClickDownloadNav: () => void
  playList?: PlayListItem[]
}

export const ButtonList = ({
  name,
  dbId,
  isFavorite,
  handleClickDownloadNav,
  playList
}: Props) => {
  const pathName = usePathname()
  const user = useUserStore((state) => state.user)
  const router = useRouter()
  const showReader =
    pathName.startsWith('/novel') && (playList?.length ?? 0) > 0

  return (
    <div className="flex gap-2 ml-auto">
      {showReader && (
        <ReaderEntry id={dbId} title={name} playList={playList!} />
      )}

      <Tooltip content="下载资源">
        <Button
          color="primary"
          variant="shadow"
          isIconOnly
          aria-label="下载资源"
          onPress={handleClickDownloadNav}
        >
          <Download className="size-5" />
        </Button>
      </Tooltip>

      <FavoriteButton dbId={dbId} isFavorite={isFavorite} />

      <ShareButton name={name} pathName={pathName} />

      <FeedbackButton name={name} dbId={dbId} />

      {user.role > 2 ? (
        <Tooltip content="编辑资源">
          <Button
            variant="bordered"
            isIconOnly
            aria-label="编辑资源"
            onPress={() => {
              router.push(`/admin/resource?query=${dbId}`)
            }}
          >
            <Pencil className="size-5" />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  )
}
