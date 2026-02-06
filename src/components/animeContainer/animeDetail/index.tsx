'use client'

import { useRef, useEffect, useState } from 'react'

import { Card, CardBody } from '@heroui/react'

import { Cover, Introduction } from '@/types/common/detail-container'
import { formatNumber } from '@/utils/formatNumber'
import { formatDate } from '@/utils/time'

import { AliasList } from './AliasList'
import { CoverImage } from './CoverImage'
import { IntroText } from './IntroText'
import { MetaInfo } from './MetaInfo'
import { TagList } from './TagList'

interface AnimeDetailProps {
  coverData: Cover
  introduce: Introduction
  stats: {
    view: number
    download: number
  }
}

export const AnimeDetail = ({
  coverData,
  introduce,
  stats
}: AnimeDetailProps) => {
  const { title, author, image, translator } = coverData
  const [shouldShowExpand, setShouldShowExpand] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hasCheckedHeight, setHasCheckedHeight] = useState(false)

  // DOM refs for height comparison
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 构建元数据信息（分两行）
  const { primaryItems, secondaryItems } = buildMetaItems({
    stats,
    author,
    translator,
    released: introduce.released,
    dbId: introduce.dbId,
    created: introduce.created,
    updated: introduce.updated
  })

  // 简介文本
  const introText = introduce.text

  // 检测内容高度是否超过图片高度 - 只在首次渲染时检测
  useEffect(() => {
    if (hasCheckedHeight) return

    const checkHeight = () => {
      if (imageRef.current && contentRef.current) {
        const imageHeight = imageRef.current.offsetHeight
        const contentHeight = contentRef.current.scrollHeight
        setShouldShowExpand(contentHeight > imageHeight)
        setHasCheckedHeight(true)
      }
    }

    // 使用 requestAnimationFrame 确保 DOM 已更新
    const rafId = requestAnimationFrame(checkHeight)

    return () => cancelAnimationFrame(rafId)
  }, [hasCheckedHeight, introText])

  // 窗口大小变化时重新检测（需要重置检测状态）
  useEffect(() => {
    const handleResize = () => {
      setHasCheckedHeight(false)
      setExpanded(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Card className="shadow-none rounded-none">
      <CardBody className="p-0">
        {/* 标题和元数据区域 */}
        <div className="flex gap-4">
          {/* 左侧封面图 */}
          <div ref={imageRef} className="h-fit">
            <CoverImage src={image} alt={title} />
          </div>

          {/* 右侧文字信息 */}
          <div ref={contentRef} className="flex-1 min-w-0">
            {/* 标题 */}
            <h1 className="text-lg sm:text-xl font-bold text-foreground line-clamp-2 mb-2">
              {title}
            </h1>

            {/* 元数据行 */}
            <MetaInfo primaryItems={primaryItems} secondaryItems={secondaryItems} />

            {/* 标签区域 */}
            <TagList tags={introduce.tags} />

            {/* 简介 */}
            <IntroText
              text={introText}
              shouldShowExpand={shouldShowExpand}
              expanded={expanded}
              onExpandChange={setExpanded}
            />
          </div>
        </div>

        {/* 别名区域 */}
        <AliasList aliases={introduce.alias} />
      </CardBody>
    </Card>
  )
}

// 构建元数据信息的辅助函数
interface BuildMetaItemsParams {
  stats: { view: number; download: number }
  author?: string
  translator?: string
  released?: string
  dbId?: string
  created?: string
  updated?: string
}

interface MetaItemsResult {
  primaryItems: string[]
  secondaryItems: string[]
}

function buildMetaItems(params: BuildMetaItemsParams): MetaItemsResult {
  const { stats, author, translator, released, dbId, created, updated } = params

  // 第一行：播放、下载、dbId
  const primaryItems: string[] = []
  primaryItems.push(`${formatNumber(stats.view)}播放`)
  primaryItems.push(`${formatNumber(stats.download)}下载`)
  if (dbId) primaryItems.push(`dbId：${dbId}`)

  // 第二行：其他元信息
  const secondaryItems: string[] = []
  if (author) secondaryItems.push(`原作：${author}`)
  if (translator) secondaryItems.push(`字幕：${translator}`)
  if (released) secondaryItems.push(`发行：${released}`)

  // 时间信息
  const createdDate = created ? formatDate(created, { isShowYear: true }) : null
  const updatedDate = updated ? formatDate(updated, { isShowYear: true }) : null
  if (createdDate) secondaryItems.push(`发布：${createdDate}`)

  if (updatedDate && updatedDate !== createdDate) {
    secondaryItems.push(`更新：${updatedDate}`)
  }

  return { primaryItems, secondaryItems }
}
