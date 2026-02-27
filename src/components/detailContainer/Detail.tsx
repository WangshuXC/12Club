'use client'

import { useState } from 'react'

import { Tooltip } from '@heroui/react'
import { Eye, Download, MessageSquare, Heart } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { Cover } from '@/types/common/detail-container'
import { formatNumber } from '@/utils/formatNumber'

import { ButtonList } from './ButtonList'

interface DetailCoverProps {
  setSelected: (value: string) => void
  coverData: Cover
  dbId: string
  isFavorite: boolean
  view: number
  download: number
  comment: number
  favorited: number
}

interface DetailStatusProps {
  data: {
    view: number
    download: number
    comment: number
    favorited: number
  }
  disableTooltip?: boolean
  className?: string
}

export const DetailStatus = ({
  data,
  disableTooltip = true,
  className
}: DetailStatusProps) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-4 justify-start text-sm text-default-500',
        className
      )}
    >
      <Tooltip isDisabled={disableTooltip} content="浏览数" placement="bottom">
        <div className="flex items-center gap-1">
          <Eye className="size-4" />
          <span>{formatNumber(data?.view || 0)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="下载数" placement="bottom">
        <div className="flex items-center gap-1">
          <Download className="size-4" />
          <span>{formatNumber(data?.download || 0)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="评论数" placement="bottom">
        <div className="flex items-center gap-1">
          <MessageSquare className="size-4" />
          <span>{formatNumber(data?.comment || 0)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="收藏数" placement="bottom">
        <div className="flex items-center gap-1">
          <Heart className="size-4" />
          <span>{formatNumber(data?.favorited || 0)}</span>
        </div>
      </Tooltip>
    </div>
  )
}

export const DetailCover = ({
  setSelected,
  coverData,
  dbId,
  isFavorite,
  view,
  download,
  comment,
  favorited
}: DetailCoverProps) => {
  const { title, author, image, translator } = coverData
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative h-fit shadow-xl w-full rounded-2xl overflow-hidden ">
      <div
        className={cn(
          'absolute h-full w-full -z-10 bg-cover bg-center bg-fixed top-0 left-0 blur-md'
        )}
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="w-full h-fit p-4 grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr] gap-4">
        <div className="imageContainer relative aspect-[5/7] w-full rounded-xl overflow-hidden shadow-lg">
          <Image
            src={imageError ? '/no-pic.jpg' : image}
            onError={() => setImageError(true)}
            alt="cover"
            className="object-cover"
            fill
          />
        </div>
        <div className="w-full min-h-44 md:min-h-64 xl:min-h-96 bg-transparent shadow-none rounded-none sm:py-4 xl:py-8 flex flex-col justify-between">
          <div className="bg-background/80 dark:bg-default-100/50 border-none rounded-xl flex-col items-start p-2">
            <h1 className="text-sm xs:text-md md:text-lg lg:text-2xl font-semibold tracking-wide text-sky-500 uppercase">
              {title}
            </h1>
            <p className="text-tiny md:text-md text-gray-500 dark:text-gray-300">
              {author}
            </p>
            <p className="text-tiny md:text-md text-gray-500 dark:text-gray-300">
              {translator}
            </p>
            <DetailStatus
              data={{ view, download, comment, favorited }}
              className="mt-2"
            />
          </div>

          <div className="hidden w-fit p-2 xl:block bg-background/80 dark:bg-default-100/50 z-10 rounded-xl">
            <ButtonList
              name={title}
              dbId={dbId}
              isFavorite={isFavorite}
              handleClickDownloadNav={() => {
                setSelected('resources')
                window.scrollTo(0, document.body.scrollHeight)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
