'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FoliateReader } from './FoliateReader'
import { TxtReader } from './TxtReader'
import { isFoliateFormat } from './loader'

import type { BookTocItem, ReaderFile, ReaderFlow } from '@/types/common/reader'

interface ScrollFeedReaderProps {
  files: ReaderFile[]
  currentIndex: number
  flow: ReaderFlow
  onIndexChange: (index: number) => void
  onReady?: (info: { toc: BookTocItem[]; goTo: (href: string) => void }) => void
}

const ANIMATION_MS = 450

// 双 reader 接力：滚动到当前 reader 边界时，平滑滑到相邻 file 并切换 currentIndex。
// 同时挂载「上一/当前/下一」三个槽位，使用 file.index 作为 key 保证切换时实例不被卸载，
// 切换过程中目标 reader 内容已完成加载，达到无缝过渡效果。
export const ScrollFeedReader = ({
  files,
  currentIndex,
  flow,
  onIndexChange,
  onReady
}: ScrollFeedReaderProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  const currentIndexRef = useRef(currentIndex)
  const [animating, setAnimating] = useState(false)
  const [viewportH, setViewportH] = useState(0)

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // 滑动窗口：始终包含 current 以及前后各一个（边界处自动收缩）
  const windowFiles = useMemo(() => {
    const start = Math.max(0, currentIndex - 1)
    const end = Math.min(files.length - 1, currentIndex + 1)

    return files.slice(start, end + 1)
  }, [files, currentIndex])

  // current 在窗口中的相对位置（用于计算 scrollTop）
  const currentPosInWindow = useMemo(() => {
    const start = Math.max(0, currentIndex - 1)

    return currentIndex - start
  }, [currentIndex])

  // 监听 wrapper 高度变化
  useEffect(() => {
    const el = wrapperRef.current

    if (!el) {
      return
    }

    const update = () => setViewportH(el.clientHeight)

    update()
    const ro = new ResizeObserver(update)

    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  // currentIndex 变化（或窗口变化）后，把滚动位置对齐到 current 槽位
  // 动画期间不重置，等动画结束后才静默对齐
  useEffect(() => {
    if (animatingRef.current) {
      return
    }

    const el = wrapperRef.current

    if (!el || viewportH === 0) {
      return
    }

    el.scrollTo({ top: currentPosInWindow * viewportH, behavior: 'auto' })
  }, [currentIndex, currentPosInWindow, viewportH])

  const slideTo = useCallback(
    (direction: 'top' | 'bottom') => {
      if (animatingRef.current) {
        return
      }

      const el = wrapperRef.current

      if (!el || viewportH === 0) {
        return
      }

      const idx = currentIndexRef.current
      const nextIndex = direction === 'bottom' ? idx + 1 : idx - 1

      if (nextIndex < 0 || nextIndex >= files.length) {
        return
      }

      animatingRef.current = true
      setAnimating(true)

      // 当前 scrollTop = currentPosInWindow * viewportH；目标 = ±viewportH
      const targetTop =
        currentPosInWindow * viewportH +
        (direction === 'bottom' ? viewportH : -viewportH)

      el.scrollTo({ top: targetTop, behavior: 'smooth' })

      // 动画结束后推进 currentIndex；windowFiles 会重新计算，
      // 由于 DOM 用 file.index 作 key，目标 reader 实例被保留，
      // 静默对齐 scrollTop 后视觉上无跳变
      window.setTimeout(() => {
        animatingRef.current = false
        setAnimating(false)
        onIndexChange(nextIndex)
      }, ANIMATION_MS)
    },
    [currentPosInWindow, files.length, onIndexChange, viewportH]
  )

  const handleBoundary = useCallback(
    (which: ReaderFile) => (direction: 'top' | 'bottom') => {
      // 仅当前 reader 触发的边界事件才有效，预渲染槽位忽略
      if (which.index !== currentIndexRef.current) {
        return
      }

      slideTo(direction)
    },
    [slideTo]
  )

  const renderOne = (file: ReaderFile) => {
    const isCurrent = file.index === currentIndex
    const body = (() => {
      if (file.format === 'txt') {
        return <TxtReader file={file} onScrollBoundary={handleBoundary(file)} />
      }

      if (isFoliateFormat(file.format)) {
        return (
          <FoliateReader
            file={file}
            flow={flow}
            // 仅当前 reader 上报目录给外层，避免预渲染槽位覆盖
            onReady={isCurrent ? onReady : undefined}
            onScrollBoundary={handleBoundary(file)}
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
    })()

    return (
      <div
        key={file.index}
        className="w-full shrink-0 relative"
        style={{ height: viewportH }}
      >
        {body}
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full overflow-hidden"
      style={{ pointerEvents: animating ? 'none' : 'auto' }}
    >
      {viewportH > 0 && (
        <div className="flex flex-col w-full">{windowFiles.map(renderOne)}</div>
      )}
    </div>
  )
}
