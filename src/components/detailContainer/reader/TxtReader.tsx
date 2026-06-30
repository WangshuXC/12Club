'use client'

import { useEffect, useRef, useState } from 'react'

import { Spinner, Button } from '@heroui/react'
import { Minus, Plus } from 'lucide-react'

import { fetchFileAsText } from './loader'

import type { ReaderViewProps } from '@/types/common/reader'

const MIN_FONT = 14
const MAX_FONT = 28
const SCROLL_EDGE_PX = 2
const WHEEL_THRESHOLD = 6

export const TxtReader = ({ file, onScrollBoundary }: ReaderViewProps) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fontSize, setFontSize] = useState(18)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onBoundaryRef = useRef(onScrollBoundary)

  useEffect(() => {
    onBoundaryRef.current = onScrollBoundary
  }, [onScrollBoundary])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !onScrollBoundary) {
      return
    }

    let edgeAccum = 0
    let lastEdgeAt = 0
    let touchStartY = 0

    const handleWheel = (e: WheelEvent) => {
      const atTop = el.scrollTop <= SCROLL_EDGE_PX
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EDGE_PX
      const now = Date.now()

      if (now - lastEdgeAt > 200) {
        edgeAccum = 0
      }

      lastEdgeAt = now

      if (e.deltaY > 0 && atBottom) {
        edgeAccum += e.deltaY

        if (edgeAccum >= WHEEL_THRESHOLD) {
          edgeAccum = 0
          onBoundaryRef.current?.('bottom')
        }
      } else if (e.deltaY < 0 && atTop) {
        edgeAccum += -e.deltaY

        if (edgeAccum >= WHEEL_THRESHOLD) {
          edgeAccum = 0
          onBoundaryRef.current?.('top')
        }
      } else {
        edgeAccum = 0
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? touchStartY
      const dy = touchStartY - endY

      if (Math.abs(dy) < 30) {
        return
      }

      const atTop = el.scrollTop <= SCROLL_EDGE_PX
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EDGE_PX
      if (dy > 0 && atBottom) {
        onBoundaryRef.current?.('bottom')
      } else if (dy < 0 && atTop) {
        onBoundaryRef.current?.('top')
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: true })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onScrollBoundary])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    fetchFileAsText(file.link)
      .then((text) => {
        if (!cancelled) {
          setContent(text)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('加载文本失败:', err)

        if (!cancelled) {
          setError(err instanceof Error ? err.message : '文件加载失败')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [file.link])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner label="正在加载文本..." color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-6 text-center">
        <p className="text-lg font-semibold text-danger">无法加载该文件</p>
        <p className="text-sm text-default-400">{error}</p>
        <p className="text-xs text-default-400">
          请确认文件链接有效，且存储服务已开启跨域访问（CORS）。
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 字号调节 */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-background/70 backdrop-blur px-1 py-1 shadow-medium">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="减小字号"
          isDisabled={fontSize <= MIN_FONT}
          onPress={() => setFontSize((s) => Math.max(MIN_FONT, s - 2))}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-xs text-default-500 w-8 text-center">
          {fontSize}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="增大字号"
          isDisabled={fontSize >= MAX_FONT}
          onPress={() => setFontSize((s) => Math.min(MAX_FONT, s + 2))}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div ref={scrollRef} className="w-full h-full overflow-y-auto">
        <article
          className="mx-auto max-w-[720px] px-5 py-8 whitespace-pre-wrap break-words text-foreground leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {content}
        </article>
      </div>
    </div>
  )
}
