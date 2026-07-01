'use client'

import { useState } from 'react'

import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/react'
import { ChevronRight } from 'lucide-react'

import { Cover, Introduction } from '@/types/common/detail-container'
import { formatNumber } from '@/utils/formatNumber'
import { formatDate } from '@/utils/time'

import { AliasList } from './AliasList'
import { CoverImage } from './CoverImage'
import { IntroText } from './IntroText'
import { TagList } from './TagList'

interface MobileAnimeDetailProps {
  coverData: Cover
  introduce: Introduction
  stats: {
    view: number
    download: number
  }
}

export const MobileAnimeDetail = ({
  coverData,
  introduce,
  stats
}: MobileAnimeDetailProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const primaryItems: string[] = []
  primaryItems.push(`${formatNumber(stats.view)}播放`)
  primaryItems.push(`${formatNumber(stats.download)}下载`)

  const secondaryItems: string[] = []
  const { author, translator } = coverData
  if (author) secondaryItems.push(`原作：${author}`)
  if (translator) secondaryItems.push(`字幕：${translator}`)
  if (introduce.released) secondaryItems.push(`发行：${introduce.released}`)
  if (introduce.dbId) secondaryItems.push(`dbId：${introduce.dbId}`)

  const createdDate = introduce.created
    ? formatDate(introduce.created, { isShowYear: true })
    : null
  const updatedDate = introduce.updated
    ? formatDate(introduce.updated, { isShowYear: true })
    : null
  if (createdDate) secondaryItems.push(`发布：${createdDate}`)

  if (updatedDate && updatedDate !== createdDate) {
    secondaryItems.push(`更新：${updatedDate}`)
  }

  return (
    <>
      {/* 外层精简卡片 */}
      <div
        className="flex items-center justify-between p-3 rounded-lg bg-content1 cursor-pointer active:opacity-70"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground line-clamp-1">
            {coverData.title}
          </h1>
          <p className="text-xs text-default-500 mt-1">
            {primaryItems.join(' · ')}
          </p>
        </div>
        <div className="flex items-center text-default-400 ml-2 shrink-0">
          <span className="text-xs">详情</span>
          <ChevronRight className="size-4" />
        </div>
      </div>

      {/* 底部 Drawer */}
      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom"
        size="4xl"
        classNames={{
          wrapper: 'z-[9999]',
          backdrop: 'z-[9998]'
        }}
      >
        <DrawerContent>
          <DrawerHeader>详情</DrawerHeader>
          <DrawerBody className="py-4 overflow-y-auto">
            {/* 封面 + 标题 + 播放下载 */}
            <div className="flex gap-3">
              <CoverImage
                src={coverData.image}
                alt={coverData.title}
                className="!w-[100px] !h-[134px]"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-foreground line-clamp-2 mb-1.5">
                  {coverData.title}
                </h2>
                <div className="text-xs text-default-500">
                  {primaryItems.map((item, i) => (
                    <span key={i}>
                      {i > 0 && (
                        <span className="mx-1 text-default-300">·</span>
                      )}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 详细元信息 */}
            {secondaryItems.length > 0 && (
              <div className="mt-3 text-xs text-default-500 leading-relaxed">
                {secondaryItems.map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            )}

            {/* 别名 */}
            <AliasList aliases={introduce.alias} />

            {/* 标签 */}
            {introduce.tags.length > 0 && (
              <div className="mt-3">
                <TagList tags={introduce.tags} maxDisplay={10} />
              </div>
            )}

            {/* 简介 */}
            <div className="mt-3">
              <IntroText
                text={introduce.text}
                shouldShowExpand={introduce.text.length > 200}
                expanded={expanded}
                onExpandChange={setExpanded}
              />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
