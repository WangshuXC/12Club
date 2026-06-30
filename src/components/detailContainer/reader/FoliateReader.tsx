'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

import { Spinner } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'

import { loadFoliateView, fetchFileAsFile } from './loader'

import type { BookTocItem, ReaderViewProps } from '@/types/common/reader'

// foliate-view 元素实例（仅用到部分方法，做最小类型声明）
interface FoliateView extends HTMLElement {
  open: (file: File | Blob | string) => Promise<void>
  close: () => void
  goLeft: () => void
  goRight: () => void
  goTo: (target: string) => Promise<unknown>
  book?: { toc?: BookTocItem[] }
  renderer?: {
    next: () => void
    prev: () => void
    // 强制跨章节切换（不在当前章节内滚动）
    prevSection?: () => Promise<unknown> | void
    nextSection?: () => Promise<unknown> | void
    setStyles?: (css: string) => void
    setAttribute: (name: string, value: string) => void
    // 是否已到达整本书的开头/结尾（跨章节判断，scrolled 与 paginated 都可用）
    readonly atStart?: boolean
    readonly atEnd?: boolean
  }
}

// 阅读区域内注入的样式（适配明暗主题）
const getReaderCSS = (isDark: boolean): string => {
  const bg = isDark ? '#0B0F14' : '#FFFFFF'
  const fg = isDark ? '#E5E7EB' : '#1A1A1A'

  return `
    @namespace epub "http://www.idpf.org/2007/ops";
    html {
      color-scheme: ${isDark ? 'dark' : 'light'};
    }
    html, body {
      background: ${bg} !important;
      color: ${fg} !important;
    }
    body {
      font-family: -apple-system, "Source Han Sans SC", "Noto Sans CJK SC", sans-serif;
      line-height: 1.7;
    }
    p, li, blockquote {
      line-height: 1.7;
    }
    a:any-link {
      color: #0CA5E9;
    }
  `
}

export const FoliateReader = ({
  file,
  flow = 'paginated',
  onReady,
  onScrollBoundary
}: ReaderViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<FoliateView | null>(null)
  const flowRef = useRef(flow)
  // 章节边界自动加载锁：避免 wheel 事件高频触发时反复调用 next/prev
  const boundaryLockRef = useRef(false)
  const lastIndexRef = useRef<number | null>(null)
  const wheelCleanupRef = useRef<(() => void) | null>(null)
  const onScrollBoundaryRef = useRef(onScrollBoundary)

  useEffect(() => {
    onScrollBoundaryRef.current = onScrollBoundary
  }, [onScrollBoundary])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fraction, setFraction] = useState(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // 同步最新的 flow 给事件回调使用（避免事件闭包捕获到旧值）
  useEffect(() => {
    flowRef.current = flow
  }, [flow])

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) {
      return
    }

    setLoading(true)
    setError('')
    setFraction(0)

    const init = async () => {
      await loadFoliateView()
      const blobFile = await fetchFileAsFile(file.link)
      if (cancelled) {
        return
      }

      const view = document.createElement('foliate-view') as FoliateView
      view.style.width = '100%'
      view.style.height = '100%'
      view.addEventListener('relocate', (e: Event) => {
        const detail = (e as CustomEvent).detail
        const f = detail?.fraction

        if (typeof f === 'number') {
          setFraction(f)
        }
        // 注意：不在此解锁 boundaryLockRef，由 handleEdge 的 setTimeout 统一兜底，
        // 避免章节切换瞬间解锁后，连续 wheel 事件继续触发误判
      })

      // 在每个章节 iframe body 末尾注入「上一章 / 下一章」按钮
      const docCleanups: Array<() => void> = []

      const triggerEdge = (direction: 'top' | 'bottom') => {
        if (boundaryLockRef.current) {
          return
        }

        const renderer = viewRef.current?.renderer
        const bookAtEnd = renderer?.atEnd === true
        const bookAtStart = renderer?.atStart === true

        boundaryLockRef.current = true
        window.setTimeout(() => {
          boundaryLockRef.current = false
        }, 600)

        // 使用 prevSection/nextSection 强制跨章节，
        // 否则 scrolled 模式下 renderer.prev/next 仅会在当前章节内滚动
        if (direction === 'bottom') {
          if (bookAtEnd) {
            onScrollBoundaryRef.current?.('bottom')
          } else {
            renderer?.nextSection?.()
          }
        } else if (bookAtStart) {
          onScrollBoundaryRef.current?.('top')
        } else {
          renderer?.prevSection?.()
        }
      }

      const NAV_STYLE_ID = '__reader_chapter_nav_style__'
      const NAV_CONTAINER_ID = '__reader_chapter_nav__'

      const injectChapterNav = (doc: Document) => {
        if (!doc.body) {
          return () => undefined
        }

        // 样式只注入一次
        if (!doc.getElementById(NAV_STYLE_ID)) {
          const style = doc.createElement('style')

          style.id = NAV_STYLE_ID
          style.textContent = `
            #${NAV_CONTAINER_ID} {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              margin: 48px auto 24px;
              max-width: 720px;
              padding: 0 16px;
              box-sizing: border-box;
            }
            #${NAV_CONTAINER_ID} button {
              flex: 1;
              padding: 12px 16px;
              border-radius: 9999px;
              border: 1px solid rgba(127,127,127,0.3);
              background: transparent;
              color: inherit;
              font: inherit;
              font-size: 14px;
              cursor: pointer;
              transition: background-color 0.15s ease, opacity 0.15s ease;
              -webkit-tap-highlight-color: transparent;
            }
            #${NAV_CONTAINER_ID} button:hover {
              background: rgba(127,127,127,0.12);
            }
            #${NAV_CONTAINER_ID} button:disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }
          `
          doc.head?.appendChild(style)
        }

        // 已注入则不重复
        if (doc.getElementById(NAV_CONTAINER_ID)) {
          return () => undefined
        }

        const renderer = viewRef.current?.renderer
        const isFirstFile = file.index === 0
        const isLastFile = false // 由外层 onScrollBoundary 判断，按钮内统一可点
        const wrap = doc.createElement('nav')

        wrap.id = NAV_CONTAINER_ID
        wrap.setAttribute('aria-label', '章节切换')

        const prevBtn = doc.createElement('button')

        prevBtn.type = 'button'
        prevBtn.textContent = '← 上一章'
        prevBtn.disabled =
          renderer?.atStart === true && isFirstFile

        const nextBtn = doc.createElement('button')

        nextBtn.type = 'button'
        nextBtn.textContent = '下一章 →'
        nextBtn.disabled = isLastFile

        const onPrev = (e: Event) => {
          e.preventDefault()
          triggerEdge('top')
        }

        const onNext = (e: Event) => {
          e.preventDefault()
          triggerEdge('bottom')
        }

        prevBtn.addEventListener('click', onPrev)
        nextBtn.addEventListener('click', onNext)
        wrap.appendChild(prevBtn)
        wrap.appendChild(nextBtn)
        doc.body.appendChild(wrap)

        return () => {
          prevBtn.removeEventListener('click', onPrev)
          nextBtn.removeEventListener('click', onNext)

          try {
            wrap.remove()
          } catch {
            // ignore
          }
        }
      }

      const onLoad = (e: Event) => {
        const detail = (e as CustomEvent).detail
        const doc: Document | undefined = detail?.doc

        if (!doc?.body) {
          return
        }

        // 延迟到 foliate 完成本章节布局后再注入，避免插入新节点
        // 影响 foliate 内部 createTreeWalker / measure 的 body 引用
        let cleanup: (() => void) | null = null
        const handle = window.requestAnimationFrame(() => {
          if (!doc.body || !doc.defaultView) {
            return
          }

          cleanup = injectChapterNav(doc)
        })

        docCleanups.push(() => {
          window.cancelAnimationFrame(handle)
          cleanup?.()
        })
      }

      view.addEventListener('load', onLoad)

      wheelCleanupRef.current = () => {
        view.removeEventListener('load', onLoad)

        while (docCleanups.length) {
          docCleanups.pop()?.()
        }
      }

      container.replaceChildren(view)
      viewRef.current = view

      await view.open(blobFile)

      if (cancelled) {
        return
      }

      // 应用阅读方向（分页/滚动）与样式
      view.renderer?.setAttribute('flow', flow === 'scrolled' ? 'scrolled' : 'paginated')
      view.renderer?.setStyles?.(getReaderCSS(isDark))
      view.renderer?.next()
      // 暴露目录与跳转方法
      onReady?.({
        toc: view.book?.toc ?? [],
        goTo: (href: string) => {
          view.goTo(href).catch((err) => console.warn('章节跳转失败:', err))
        }
      })
      setLoading(false)
    }

    init().catch((err) => {
      console.error('加载阅读器失败:', err)

      if (!cancelled) {
        setError(err instanceof Error ? err.message : '文件加载失败')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      wheelCleanupRef.current?.()
      wheelCleanupRef.current = null

      // 必须调用 view.close() 释放 renderer 内部的 ResizeObserver/IntersectionObserver
      // 与 iframe，否则 Modal 关闭后异步回调访问已分离的 document 会抛
      // "Cannot read properties of null (reading 'documentElement')"
      try {
        viewRef.current?.close()
      } catch (err) {
        console.warn('关闭阅读器失败:', err)
      }

      container.replaceChildren()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.link])

  // 主题变化时重新应用阅读区样式
  useEffect(() => {
    viewRef.current?.renderer?.setStyles?.(getReaderCSS(isDark))
  }, [isDark])

  // 阅读方向切换（paginated <-> scrolled）
  useEffect(() => {
    viewRef.current?.renderer?.setAttribute(
      'flow',
      flow === 'scrolled' ? 'scrolled' : 'paginated'
    )
  }, [flow])

  const goPrev = useCallback(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    if (flow === 'scrolled') {
      view.renderer?.prev()
    } else {
      view.goLeft()
    }
  }, [flow])
  const goNext = useCallback(() => {
    const view = viewRef.current
    if (!view) {
      return
    }

    if (flow === 'scrolled') {
      view.renderer?.next()
    } else {
      view.goRight()
    }
  }, [flow])

  // 键盘翻页：分页模式用左右键，滚动模式用上下键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const prevKey = flow === 'scrolled' ? 'ArrowUp' : 'ArrowLeft'
      const nextKey = flow === 'scrolled' ? 'ArrowDown' : 'ArrowRight'
      if (e.key === prevKey) {
        goPrev()
      } else if (e.key === nextKey) {
        goNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goPrev, goNext, flow])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Spinner label="正在加载阅读内容..." color="primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-lg font-semibold text-danger">无法加载该文件</p>
          <p className="text-sm text-default-400">{error}</p>
          <p className="text-xs text-default-400">
            请确认文件链接有效，且存储服务已开启跨域访问（CORS）。
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* 翻页热区：仅分页模式启用 */}
          {flow !== 'scrolled' && (
            <>
              <button
                type="button"
                aria-label="上一页"
                onClick={goPrev}
                className="group absolute left-0 top-0 h-full w-[15%] flex items-center justify-start pl-2 cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-8 h-8 text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                type="button"
                aria-label="下一页"
                onClick={goNext}
                className="group absolute right-0 top-0 h-full w-[15%] flex items-center justify-end pr-2 cursor-pointer focus:outline-none"
              >
                <ChevronRight className="w-8 h-8 text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </>
          )}

          {/* 阅读进度条 */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-default-200/50">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.round(fraction * 100)}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
