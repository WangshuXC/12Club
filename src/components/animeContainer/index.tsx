'use client'

import { useState, memo, useRef, useCallback, useEffect } from 'react'

import { Tab, Tabs, Card, CardBody, Image } from '@heroui/react'
import Link from 'next/link'

import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { Introduction, Cover } from '@/types/common/detail-container'
import { FetchPost } from '@/utils/fetch'

import { ArtPlayer } from '../detailContainer/ArtPlayer'
import { Comments } from '../detailContainer/comment/Comments'

import { PlaylistTab } from './PlaylistTab'
import { ResourceTab } from './ResourceTab'
import { ActionBar } from './actionBar'
import { AnimeDetail } from './animeDetail'
import { MobileAnimeDetail } from './animeDetail/MobileAnimeDetail'

// 系列资源类型
interface SeriesResource {
  dbId: string
  name: string
  image: string
  released: string | null
}

// 系列信息类型
interface SeriesInfo {
  id: number
  name: string
  description: string
  resources: SeriesResource[]
}

interface AnimeContainerProps {
  id: string
  introduce: Introduction
  coverData: Cover
  series?: SeriesInfo[] | null
}

const AnimeContainerComponent = ({
  id,
  introduce,
  coverData,
  series
}: AnimeContainerProps) => {
  const [accordion, setAccordion] = useState(1)
  const hasMultipleEpisodes = introduce?.playList?.length > 1
  const [selectedTab, setSelectedTab] = useState(
    hasMultipleEpisodes ? 'playlist' : 'resources'
  )
  const commentRef = useRef<HTMLDivElement>(null)
  const { trackCustom } = useTrackingContext()

  useEffect(() => {
    trackCustom('resource_detail_view', { dbid: id, resource_type: 'anime' })
  }, [id, trackCustom])

  const handleAccordionChange = (newAccordion: number) => {
    window?.umami?.track(`在线播放-${newAccordion.toString()}`, {
      dbId: id
    })
    FetchPost('/detail/view', {
      resourceDbId: id
    })
    trackCustom('episode_select', {
      dbid: id,
      episode: newAccordion,
      previous_episode: accordion
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

  const handleVideoProgress = useCallback(
    (progress: number) => {
      trackCustom('play_progress', { dbid: id, episode: accordion, progress })
    },
    [accordion, id, trackCustom]
  )

  const handleVideoComplete = useCallback(() => {
    trackCustom('play_complete', { dbid: id, episode: accordion })
  }, [accordion, id, trackCustom])

  const handleVideoError = useCallback(() => {
    trackCustom('play_error', { dbid: id, episode: accordion })
  }, [accordion, id, trackCustom])

  return (
    <div className="container py-4 px-3 sm:px-4">
      {/* 响应式布局：移动端单列，PC端左右分栏 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 左侧/上方 内容区域 */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* 播放器 */}
          <div className="rounded-lg overflow-hidden bg-black">
            <ArtPlayer
              key={accordion}
              src={introduce?.playList[accordion - 1]?.link || ''}
              onPlay={handleVideoPlay}
              onProgress={handleVideoProgress}
              onComplete={handleVideoComplete}
              onError={handleVideoError}
            />
          </div>

          {/* 操作按钮栏 */}
          <ActionBar
            dbId={id}
            title={coverData.title}
            isFavorite={introduce?.isFavorite ?? false}
            stats={{
              comment: introduce?._count.comment ?? 0,
              favorited: introduce?._count.favorited ?? 0
            }}
            onScrollToComment={handleScrollToComment}
            coverImage={coverData.image}
          />

          {/* 移动端：精简详情+底部Drawer */}
          <div className="md:hidden">
            <MobileAnimeDetail
              coverData={coverData}
              introduce={introduce}
              stats={{
                view: introduce?._count.view ?? 0,
                download: introduce?._count.download ?? 0
              }}
            />
          </div>

          {/* 移动端：分集/资源Tab紧跟操作栏下方 */}
          <div className="md:hidden">
            {hasMultipleEpisodes ? (
              <Tabs
                className="w-full overflow-hidden shadow-medium rounded-large"
                fullWidth={true}
                defaultSelectedKey="playlist"
                onSelectionChange={(value) => {
                  const tab = value.toString()
                  setSelectedTab(tab)
                  trackCustom('anime_detail_tab_change', { dbid: id, tab })
                }}
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
                  <ResourceTab id={id} playList={introduce.playList} />
                </Tab>
              </Tabs>
            ) : (
              <ResourceTab id={id} playList={introduce.playList} />
            )}
          </div>

          {/* PC端：完整图片+简介等元信息 */}
          <div className="hidden md:block">
            <AnimeDetail
              coverData={coverData}
              introduce={introduce}
              stats={{
                view: introduce?._count.view ?? 0,
                download: introduce?._count.download ?? 0
              }}
            />
          </div>

          {/* 移动端：系列作品 */}
          {series && series.length > 0 && (
            <div className="flex flex-col gap-3 md:hidden">
              {series.map((s) => (
                <Card key={s.id} className="shadow-medium">
                  <CardBody className="p-3">
                    <p className="text-base font-semibold mb-2">系列作品</p>
                    <div className="flex overflow-x-auto gap-3 pb-1 sm:flex-col sm:overflow-x-visible">
                      {s.resources.map((resource) => (
                        <Link
                          key={resource.dbId}
                          href={`/anime/${resource.dbId}`}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-default-100 shrink-0 w-48 sm:w-full ${
                            resource.dbId === id
                              ? 'bg-primary-50 border border-primary-200'
                              : ''
                          }`}
                        >
                          <Image
                            src={resource.image}
                            alt={resource.name}
                            className="w-10 h-14 rounded object-cover"
                            classNames={{
                              wrapper: 'w-10 h-14 min-w-10 flex-shrink-0'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                resource.dbId === id
                                  ? 'font-semibold text-primary'
                                  : ''
                              }`}
                            >
                              {resource.name}
                            </p>
                            {resource.released && (
                              <p className="text-xs text-default-400">
                                {resource.released}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* 评论区域 */}
          <div ref={commentRef}>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
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

        {/* 右侧Tab区域 - 仅PC端显示 */}
        <div className="hidden md:flex w-[25vw] shrink-0 flex-col gap-4">
          {hasMultipleEpisodes ? (
            <div>
              <Tabs
                className="w-full overflow-hidden shadow-medium rounded-large"
                fullWidth={true}
                defaultSelectedKey="playlist"
                onSelectionChange={(value) => {
                  const tab = value.toString()
                  setSelectedTab(tab)
                  trackCustom('anime_detail_tab_change', { dbid: id, tab })
                }}
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
                  <ResourceTab id={id} playList={introduce.playList} />
                </Tab>
              </Tabs>
            </div>
          ) : (
            <div>
              <ResourceTab id={id} playList={introduce.playList} />
            </div>
          )}

          {/* 同系列作品区域 - PC端 */}
          {series && series.length > 0 && (
            <div className="flex flex-col gap-3">
              {series.map((s) => (
                <Card key={s.id} className="shadow-medium">
                  <CardBody className="p-3">
                    <p className="text-base font-semibold mb-2">系列作品</p>
                    <div className="flex flex-col gap-2">
                      {s.resources.map((resource) => (
                        <Link
                          key={resource.dbId}
                          href={`/anime/${resource.dbId}`}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-default-100 ${
                            resource.dbId === id
                              ? 'bg-primary-50 border border-primary-200'
                              : ''
                          }`}
                        >
                          <Image
                            src={resource.image}
                            alt={resource.name}
                            className="w-10 h-14 rounded object-cover"
                            classNames={{
                              wrapper: 'w-10 h-14 min-w-10 flex-shrink-0'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                resource.dbId === id
                                  ? 'font-semibold text-primary'
                                  : ''
                              }`}
                            >
                              {resource.name}
                            </p>
                            {resource.released && (
                              <p className="text-xs text-default-400">
                                {resource.released}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
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
      prevProps.coverData === nextProps.coverData &&
      prevProps.series === nextProps.series
    )
  }
)
