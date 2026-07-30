'use client'
import { useState, useEffect } from 'react'

import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  Image,
  Tooltip
} from '@heroui/react'
import { Download, Eye, Heart, MessageSquare } from 'lucide-react'
import { useTransitionRouter } from 'next-view-transitions'

import { upPage } from '@/lib/routerTransition'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/utils/formatNumber'
import { getRouteByDbId } from '@/utils/router'

import type { PageData } from '@/types/api/page'

interface CardStatusProps {
  data: PageData
  disableTooltip?: boolean
  className?: string
}

export const CardStatus = ({
  data,
  disableTooltip = true
}: CardStatusProps) => {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 sm:gap-2 xl:gap-4 justify-start text-sm text-default-500'
      )}
    >
      <Tooltip isDisabled={disableTooltip} content="浏览数" placement="bottom">
        <div className="flex items-center gap-1">
          <Eye className="size-4" />
          <span>{formatNumber(data?.view || 0)}</span>
        </div>
      </Tooltip>

      <Tooltip isDisabled={disableTooltip} content="下载数" placement="bottom">
        <div className="hidden lg:flex items-center gap-1">
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
        <div className="hidden lg:flex items-center gap-1">
          <Heart className="size-4" />
          <span>{formatNumber(data?.favorite_by || 0)}</span>
        </div>
      </Tooltip>
    </div>
  )
}

interface CoverCardProps {
  data: PageData
  surface?: string
  position?: number
}

export const CoverCard = ({
  data,
  surface = 'unknown',
  position
}: CoverCardProps) => {
  const router = useTransitionRouter()
  const [imageSrc, setImageSrc] = useState(data.image)

  useEffect(() => {
    setImageSrc(data.image)
  }, [data.image])

  const handleImageError = () => {
    setImageSrc('/no-pic.jpg')
  }

  return (
    <Card
      radius="md"
      isPressable
      disableRipple
      className="pb-4 h-full"
      log-expose="resource_card_expose"
      log-click="resource_card_click"
      data-log-db-id={data.dbId}
      data-log-resource-type={data.dbId.charAt(0)}
      data-log-surface={surface}
      data-log-position={position}
      onPress={() => {
        setTimeout(() => {
          router.push(getRouteByDbId(data.dbId), {
            onTransitionReady: upPage
          })
        }, 100)
      }}
    >
      <CardBody className="overflow-visible w-full relative">
        <Badge
          color={
            data.status === 1
              ? 'primary'
              : data.status === 2
                ? 'warning'
                : 'default'
          }
          variant="solid"
          showOutline={false}
          isInvisible={!(data.dbId.startsWith('a') && data.status !== 0)}
          className="absolute top-4 right-8 px-2"
          content={
            data.status === 1 ? '完结' : data.status === 2 ? '老站数据' : ''
          }
        >
          <Image
            alt="Card Cover"
            radius="sm"
            classNames={{
              wrapper: '!max-w-full w-full aspect-[3/4]',
              img: 'w-full h-full object-cover aspect-[3/4]'
            }}
            src={imageSrc}
            isZoomed
            onError={handleImageError}
          />
        </Badge>
      </CardBody>
      <CardFooter className="py-0 px-4 flex-col gap-2 items-start justify-between h-full">
        <h4 className="font-bold text-sm line-clamp-2 text-left">
          {data.title}
        </h4>
        <CardStatus data={data} />
      </CardFooter>
    </Card>
  )
}
