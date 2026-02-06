'use client'

import { useState } from 'react'

import { Button, Card, CardBody, CardHeader, ScrollShadow } from '@heroui/react'
import { motion } from 'framer-motion'
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Grid2X2,
  List
} from 'lucide-react'

import { PlayListItem } from '@/types/common/detail-container'

type ViewMode = 'grid' | 'list'

// 音频波形动画组件
const SoundWaveIcon = () => {
  const bars = [
    { height: 6, delay: 0 },
    { height: 10, delay: 0.1 },
    { height: 14, delay: 0.2 },
    { height: 8, delay: 0.3 }
  ]

  return (
    <span className="flex items-end gap-0.5 h-3.5">
      {bars.map((bar, index) => (
        <motion.span
          key={index}
          className="w-0.5 bg-white rounded-full"
          animate={{
            height: [bar.height * 0.5, bar.height, bar.height * 0.5]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: bar.delay
          }}
        />
      ))}
    </span>
  )
}

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
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

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

        <div className="flex items-center gap-1">
          {/* 视图模式切换按钮 */}
          <Button
            variant="light"
            size="sm"
            isIconOnly
            className="text-default-500"
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List className="size-5" />
            ) : (
              <Grid2X2 className="size-5" />
            )}
          </Button>

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
        </div>
      </CardHeader>

      <CardBody className="px-4 pt-0 pb-4">
        <ScrollShadow className="max-h-80" hideScrollBar>
          {viewMode === 'grid' ? (

            // 网格视图（方块）
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {sortedPlayList.map((item, index) => {
                const isActive = currentAccordion === item.accordion
                const displayText =
                  item.showAccordion || item.accordion.toString()

                return (
                  <Button
                    key={index}
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
                )
              })}
            </div>
          ) : (

            // 列表视图（长条形）
            <div className="flex flex-col gap-2">
              {sortedPlayList.map((item, index) => {
                const isActive = currentAccordion === item.accordion
                const displayText =
                  item.showAccordion || item.accordion.toString()

                return (
                  <Button
                    key={index}
                    variant={isActive ? 'solid' : 'flat'}
                    color={isActive ? 'primary' : 'default'}
                    className={`
                      w-full h-12 min-w-0 px-4
                      flex items-center justify-between
                      text-base
                      ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-default-100 hover:bg-default-200 text-default-700'
                  }
                    `}
                    onPress={() => onAccordionChange(item.accordion)}
                  >
                    <span className="font-medium mr-2">第{displayText}话</span>
                    {isActive && (
                      <span className="flex items-center gap-1.5">
                        <SoundWaveIcon />
                        <span className="text-sm">正在播放</span>
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          )}
        </ScrollShadow>
      </CardBody>
    </Card>
  )
}
