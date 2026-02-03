'use client'

import { useState, memo, useRef, useCallback } from 'react'
import { ArtPlayer } from '../detailContainer/ArtPlayer'
import { AnimeDetail } from './animeDetail'
import { ActionBar } from './actionBar'
import { PlaylistTab } from './PlaylistTab'
import { ResourceTab } from './ResourceTab'
import { Comments } from '../detailContainer/comment/Comments'
import { Tab, Tabs } from '@heroui/react'
import { FetchPost } from '@/utils/fetch'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'

import { Introduction, Cover } from '@/types/common/detail-container'

interface AnimeContainerProps {
  id: string
  introduce: Introduction
  coverData: Cover
}

const AnimeContainerComponent = ({
  id,
  introduce,
  coverData
}: AnimeContainerProps) => {
  const [accordion, setAccordion] = useState(1)
  const [selectedTab, setSelectedTab] = useState('playlist')
  const commentRef = useRef<HTMLDivElement>(null)
  const { trackCustom } = useTrackingContext()

  const handleAccordionChange = (newAccordion: number) => {
    window?.umami?.track(`在线播放-${newAccordion.toString()}`, {
      dbId: id
    })
    FetchPost('/detail/view', {
      resourceDbId: id
    })
    setAccordion(newAccordion)
  }

  const handleScrollToComment = () => {
    commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 视频播放时上报埋点
  const handleVideoPlay = useCallback(() => {
    trackCustom('accordion-play', {
      accordion: accordion.toString(),
      name: coverData?.title,
      dbid: id
    })
  }, [trackCustom, accordion, coverData?.title, id])

  return (
    <div className="container py-4">
      {/* 左右分栏布局 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 左侧内容区域 */}
        <div className="flex-1 space-y-3">
          {/* 播放器 */}
          <div className="rounded-lg overflow-hidden bg-black">
            <ArtPlayer
              key={accordion}
              src={introduce?.playList[accordion - 1]?.link || ''}
              onPlay={handleVideoPlay}
            />
          </div>

          {/* 操作按钮栏 - 位于视频和详情之间 */}
          <ActionBar
            dbId={id}
            title={coverData.title}
            isFavorite={introduce?.isFavorite ?? false}
            stats={{
              comment: introduce?._count.comment ?? 0,
              favorited: introduce?._count.favorited ?? 0
            }}
            onScrollToComment={handleScrollToComment}
          />

          {/* 图片+简介等元信息 - 密集文字排布 */}
          <AnimeDetail
            coverData={coverData}
            introduce={introduce}
            stats={{
              view: introduce?._count.view ?? 0,
              download: introduce?._count.download ?? 0
            }}
          />

          {/* 评论区域 */}
          <div ref={commentRef}>
            <p className="text-2xl font-semibold text-foreground mb-2">
              评论
              <span className="text-sm text-default-400 ml-1">
                {introduce._count.comment}
              </span>
            </p>
            <Comments
              id={id}
              shouldFetchComment={introduce._count.comment > 0}
            />
          </div>
        </div>

        {/* 右侧Tab区域 */}
        <div className="w-100 shrink-0">
          <div className="lg:sticky lg:top-20">
            <Tabs
              className="w-full overflow-hidden shadow-medium rounded-large"
              fullWidth={true}
              defaultSelectedKey="playlist"
              onSelectionChange={(value) => setSelectedTab(value.toString())}
              selectedKey={selectedTab}
            >
              <Tab key="playlist" title="分集选择">
                <PlaylistTab
                  playList={introduce.playList}
                  currentAccordion={accordion}
                  onAccordionChange={handleAccordionChange}
                  coverTitle={coverData.title}
                  dbId={id}
                />
              </Tab>

              <Tab key="resources" title="下载资源">
                <ResourceTab id={id} />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// 使用 memo 优化组件，避免不必要的重新渲染
export const AnimeContainer = memo(
  AnimeContainerComponent,
  (prevProps, nextProps) => {
    // 只有当关键属性改变时才重新渲染
    return (
      prevProps.id === nextProps.id &&
      prevProps.introduce === nextProps.introduce &&
      prevProps.coverData === nextProps.coverData
    )
  }
)
