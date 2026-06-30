'use client'

import { useCallback, useEffect, useState } from 'react'

import { Modal, ModalContent, Button, Tooltip } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, List, ListTree, ScrollText, X } from 'lucide-react'

import { ChapterList } from './ChapterList'
import { FoliateReader } from './FoliateReader'
import { ScrollFeedReader } from './ScrollFeedReader'
import { TxtReader } from './TxtReader'
import { isFoliateFormat } from './loader'

import type {
  BookTocItem,
  ReaderFlow,
  ReaderModalProps
} from '@/types/common/reader'

type DrawerMode = 'files' | 'toc'

export const ReaderModal = ({
  isOpen,
  onClose,
  title,
  files,
  initialIndex = 0
}: ReaderModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('files')
  const [flow, setFlow] = useState<ReaderFlow>('paginated')
  const [toc, setToc] = useState<BookTocItem[]>([])
  const [goToHref, setGoToHref] = useState<((href: string) => void) | null>(
    null
  )
  const hasMultiple = files.length > 1
  const hasToc = toc.length > 0

  // 每次打开重置到初始文件
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setDrawerOpen(false)
      setDrawerMode(hasMultiple ? 'files' : 'toc')
    }
  }, [isOpen, initialIndex, hasMultiple])

  // 切换文件时清空上一本的目录与跳转方法
  useEffect(() => {
    setToc([])
    setGoToHref(null)
  }, [currentIndex])

  const currentFile = files[currentIndex]

  const handleSelectFile = (index: number) => {
    setCurrentIndex(index)
    setDrawerOpen(false)
  }

  const handleSelectToc = (href: string) => {
    goToHref?.(href)
    setDrawerOpen(false)
  }

  const handleReady = useCallback(
    (info: { toc: BookTocItem[]; goTo: (href: string) => void }) => {
      setToc(info.toc)
      // 用函数形式包裹以避免 setState 把函数当作 updater 调用
      setGoToHref(() => info.goTo)
    },
    []
  )

  const openDrawer = (mode: DrawerMode) => {
    setDrawerMode(mode)
    setDrawerOpen(true)
  }

  const toggleFlow = () => {
    setFlow((v) => (v === 'paginated' ? 'scrolled' : 'paginated'))
  }

  const renderReader = () => {
    if (!currentFile) {
      return null
    }

    // 上下滚动模式：用 ScrollFeedReader 实现「双 reader 接力」无缝章节滑动
    if (flow === 'scrolled' && hasMultiple) {
      return (
        <ScrollFeedReader
          files={files}
          currentIndex={currentIndex}
          flow={flow}
          onIndexChange={setCurrentIndex}
          onReady={handleReady}
        />
      )
    }

    if (currentFile.format === 'txt') {
      return <TxtReader key={currentFile.index} file={currentFile} />
    }

    if (isFoliateFormat(currentFile.format)) {
      return (
        <FoliateReader
          key={currentFile.index}
          file={currentFile}
          flow={flow}
          onReady={handleReady}
        />
      )
    }

    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-6 text-center">
        <p className="text-lg font-semibold text-warning">暂不支持的格式</p>
        <p className="text-sm text-default-400">
          该文件格式无法在线阅读，请下载后使用本地阅读器打开。
        </p>
      </div>
    )
  }

  // 是否允许显示阅读方向与书内目录控制（仅 foliate 支持的格式有效）
  const supportFoliateControls =
    !!currentFile && isFoliateFormat(currentFile.format)

  return (
    <Modal
      size="full"
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: 'rounded-none m-0 max-w-full h-screen',
        wrapper: 'items-stretch',
        body: 'p-0'
      }}
    >
      <ModalContent className="h-screen">
        {() => (
          <div className="flex flex-col h-full bg-background">
            {/* 顶部毛玻璃工具栏 */}
            <div className="h-12 shrink-0 flex items-center justify-between gap-2 px-2 sm:px-4 bg-background/70 backdrop-blur-md border-b border-default-200 z-20">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="关闭"
                  onPress={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{title}</p>
                  {hasMultiple && currentFile && (
                    <p className="text-[11px] text-default-400 truncate leading-none">
                      {currentFile.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* 阅读方向切换 */}
                {supportFoliateControls && (
                  <Tooltip
                    content={flow === 'paginated' ? '切换为上下滚动' : '切换为左右翻页'}
                  >
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      aria-label="切换阅读方向"
                      onPress={toggleFlow}
                    >
                      {flow === 'paginated' ? (
                        <ScrollText className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </Button>
                  </Tooltip>
                )}

                {/* 书内章节 */}
                {supportFoliateControls && hasToc && (
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<ListTree className="w-4 h-4" />}
                    onPress={() => openDrawer('toc')}
                  >
                    章节
                  </Button>
                )}

                {/* 多文件列表 */}
                {hasMultiple && (
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<List className="w-4 h-4" />}
                    onPress={() => openDrawer('files')}
                  >
                    文件
                  </Button>
                )}
              </div>
            </div>

            {/* 阅读区 + 抽屉 */}
            <div className="relative flex-1 overflow-hidden">
              {renderReader()}

              <AnimatePresence>
                {drawerOpen && (
                  <>
                    <motion.div
                      key="overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setDrawerOpen(false)}
                      className="absolute inset-0 bg-black/40 z-30"
                    />
                    <motion.div
                      key="drawer"
                      initial={{ x: -320 }}
                      animate={{ x: 0 }}
                      exit={{ x: -320 }}
                      transition={{ type: 'tween', duration: 0.25 }}
                      className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-background z-40 shadow-large"
                    >
                      {drawerMode === 'toc' ? (
                        <ChapterList
                          mode="toc"
                          toc={toc}
                          onSelect={handleSelectToc}
                        />
                      ) : (
                        <ChapterList
                          mode="files"
                          files={files}
                          currentIndex={currentIndex}
                          onSelect={handleSelectFile}
                        />
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}
