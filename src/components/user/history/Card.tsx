'use client'

import { Card, CardBody, Chip, Image } from '@heroui/react'
import Link from 'next/link'

import { getRouteByDbId } from '@/utils/router'
import { formatDate } from '@/utils/time'

import type { PlayHistoryItem } from '@/app/user/[id]/history/actions'

interface Props {
  item: PlayHistoryItem
}

export const PlayHistoryCard = ({ item }: Props) => {
  return (
    <Card
      isPressable
      as={Link}
      href={getRouteByDbId(item.dbId)}
      className="w-full"
    >
      <CardBody className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:h-auto sm:w-40">
            <Image
              src={item.imageUrl}
              alt={item.name}
              className="object-cover rounded-lg size-full max-h-52"
              radius="lg"
            />
          </div>
          <div className="flex w-full flex-col justify-between space-y-3">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold transition-colors line-clamp-2 hover:text-primary">
                {item.name}
              </h2>

              <div className="flex items-center gap-2 text-default-500">
                <span>第 {item.showAccordion} 集</span>
              </div>
            </div>

            <div>
              <Chip variant="flat">
                {formatDate(item.lastPlayedAt, {
                  isShowYear: true,
                  isPrecise: true
                })}
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
