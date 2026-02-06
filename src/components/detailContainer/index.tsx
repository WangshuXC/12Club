'use client'

import { useState, memo, useCallback } from 'react'

import { Button } from '@heroui/react'
import { usePathname } from 'next/navigation'

import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { Introduction, Cover } from '@/types/common/detail-container'
import { FetchPost } from '@/utils/fetch'

import { ArtPlayer } from './ArtPlayer'
import { ButtonList } from './ButtonList'
import { DetailCover } from './Detail'
import { DetailTabs } from './Tabs'

interface DetailContainerProps {
  id: string
  introduce: Introduction
  coverData: Cover
}

const DetailContainerComponent = ({
  id,
  introduce,
  coverData
}: DetailContainerProps) => {
  const pathname = usePathname()
  const { trackCustom } = useTrackingContext()

  const [selected, setSelected] = useState('introduction')
  const [accordion, setAccordion] = useState(1)

  // 视频播放时上报埋点
  const handleVideoPlay = useCallback(() => {
    trackCustom('accordion-play', {
      accordion: accordion.toString(),
      name: coverData?.title,
      dbid: id
    })
  }, [trackCustom, accordion, coverData?.title, id])

  return (
    <>
      {coverData && (
        <DetailCover
          setSelected={setSelected}
          coverData={coverData}
          dbId={id.toString()}
          isFavorite={introduce?.isFavorite ?? false}
          view={introduce?._count.view ?? 0}
          download={introduce?._count.download ?? 0}
          comment={introduce?._count.comment ?? 0}
          favorited={introduce?._count.favorited ?? 0}
        />
      )}
      <div className="xl:hidden flex items-end">
        <ButtonList
          name={coverData?.title || ''}
          dbId={id.toString()}
          isFavorite={introduce?.isFavorite ?? false}
          handleClickDownloadNav={() => setSelected('resources')}
        />
      </div>

      {pathname.startsWith('/anime') && introduce?.playList.length > 0 && (
        <>
          <div className="rounded-md lg:rounded-2xl overflow-hidden h-fit">
            <ArtPlayer
              key={accordion}
              src={introduce?.playList[accordion - 1]?.link || ''}
              onPlay={handleVideoPlay}
            />
          </div>

          {introduce?.playList?.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {introduce?.playList.map((item, index) => (
                <Button
                  key={index}
                  variant="flat"
                  size="sm"
                  color="primary"
                  className={`${accordion === item.accordion ? 'bg-primary text-white' : ''}`}
                  onPress={() => {
                    window?.umami?.track(
                      `在线播放-${item.accordion.toString()}`,
                      {
                        dbId: id
                      }
                    )
                    FetchPost('/detail/view', {
                      resourceDbId: id
                    })
                    setAccordion(item.accordion)
                  }}
                >
                  {item.showAccordion || item.accordion.toString()}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {introduce && (
        <DetailTabs
          id={id}
          selected={selected}
          setSelected={setSelected}
          introduce={introduce}
        />
      )}
    </>
  )
}

// 使用 memo 优化组件，避免不必要的重新渲染
export const DetailContainer = memo(
  DetailContainerComponent,
  (prevProps, nextProps) => {
    // 只有当 id 改变时才重新渲染
    return (
      prevProps.id === nextProps.id &&
      prevProps.introduce === nextProps.introduce &&
      prevProps.coverData === nextProps.coverData
    )
  }
)
