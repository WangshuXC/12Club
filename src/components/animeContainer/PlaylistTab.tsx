'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, ScrollShadow } from '@heroui/react'
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { PlayListItem } from '@/types/common/detail-container'

interface PlaylistTabProps {
  playList: PlayListItem[]
  currentAccordion: number
  onAccordionChange: (accordion: number) => void
  coverTitle: string
  dbId: string
}

export const PlaylistTab = ({
  playList,
  currentAccordion,
  onAccordionChange,
  coverTitle,
  dbId
}: PlaylistTabProps) => {
  const [isAscending, setIsAscending] = useState(true)

  if (!playList || playList.length === 0) {
    return (
      <Card className="shadow-none">
        <CardBody>
          <p className="text-default-500 text-center">暂无播放列表</p>
        </CardBody>
      </Card>
    )
  }

  // 根据排序状态对播放列表进行排序
  const sortedPlayList = isAscending ? [...playList] : [...playList].reverse()

  // 找到当前播放的集数在列表中的位置
  const currentIndex = playList.findIndex(
    (item) => item.accordion === currentAccordion
  )

  return (
    <Card>
      <CardHeader className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">正片</h3>
          <span className="text-sm text-default-400">
            ({currentIndex + 1}/{playList.length})
          </span>
        </div>

        {/* 排序按钮 */}
        <Button
          variant="light"
          size="sm"
          isIconOnly
          className="text-default-500"
          onPress={() => setIsAscending(!isAscending)}
        >
          {isAscending ? (
            <ArrowDownWideNarrow className="size-5" />
          ) : (
            <ArrowUpNarrowWide className="size-5" />
          )}
        </Button>
      </CardHeader>

      <CardBody className="px-4 pt-0 pb-4">
        <ScrollShadow className="max-h-80" hideScrollBar>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {sortedPlayList.map((item, index) => {
              const isActive = currentAccordion === item.accordion
              const displayText =
                item.showAccordion || item.accordion.toString()

              return (
                <div key={index}>
                  <Button
                    variant={isActive ? 'solid' : 'flat'}
                    color={isActive ? 'primary' : 'default'}
                    className={`
                      w-full aspect-square min-w-0 p-0
                      flex flex-col items-center justify-center
                      text-lg
                      ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-default-100 hover:bg-default-200 text-default-700'
                      }
                    `}
                    onPress={() => onAccordionChange(item.accordion)}
                  >
                    {displayText}
                  </Button>
                </div>
              )
            })}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  )
}
