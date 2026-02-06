'use client'
import { Tooltip, Button } from '@heroui/react'
import { Download, Pencil } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

import { useUserStore } from '@/store/userStore'

import { FavoriteButton } from './buttons/FavoriteButton'
import { FeedbackButton } from './buttons/FeedbackButton'
import { ShareButton } from './buttons/ShareButton'

interface Props {
  name: string
  dbId: string
  isFavorite: boolean
  handleClickDownloadNav: () => void
}

export const ButtonList = ({ name, dbId, isFavorite, handleClickDownloadNav }: Props) => {
  const pathName = usePathname()
  const user = useUserStore(state => state.user)
  const router = useRouter()

  return (
    <div className="flex gap-2 ml-auto">
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
      ) : null
      }
    </div >
  )
}