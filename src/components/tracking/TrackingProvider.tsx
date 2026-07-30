'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode
} from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { useTracking, UseTrackingOptions } from '@/hooks/useTracking'
import { getDeviceInfo } from '@/utils/device'

// Context 类型
interface TrackingContextValue {
  trackExpose: (eventName: string, extraData?: Record<string, unknown>) => void
  trackClick: (
    eventName: string,
    element?: HTMLElement,
    extraData?: Record<string, unknown>
  ) => void
  trackCustom: (eventName: string, extraData?: Record<string, unknown>) => void
  flush: () => Promise<void>
  getGUID: () => string
}

const TrackingContext = createContext<TrackingContextValue | null>(null)

// 自定义 Hook 获取 tracking context
export const useTrackingContext = () => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider')
  }

  return context
}

// 解析元素上的 extra data
const parseExtraData = (element: HTMLElement): Record<string, unknown> => {
  const extraData: Record<string, unknown> = {}

  // 获取所有 data-log-* 属性
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('data-log-')) {
      // HTML attribute names are normalized to kebab-case. Store fields in
      // snake_case so downstream analytics can use stable JSON paths.
      const key = attr.name.replace('data-log-', '').replace(/-/g, '_')

      try {
        // 尝试解析 JSON
        extraData[key] = JSON.parse(attr.value)
      } catch {
        extraData[key] = attr.value
      }
    }
  })

  return extraData
}

interface TrackingProviderProps {
  children: ReactNode
  options?: UseTrackingOptions
}

export const TrackingProvider = ({
  children,
  options = {}
}: TrackingProviderProps) => {
  const { trackExpose, trackClick, trackCustom, flush, getGUID } =
    useTracking(options)

  // 存储已曝光的元素
  const exposedElementsRef = useRef<WeakSet<Element>>(new WeakSet())

  // IntersectionObserver 实例
  const observerRef = useRef<IntersectionObserver | null>(null)

  // MutationObserver 实例
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  // 处理曝光事件
  const handleExpose = useCallback(
    (element: HTMLElement) => {
      // 检查是否已曝光
      if (exposedElementsRef.current.has(element)) {
        return
      }

      const eventName =
        element.getAttribute('log-expose') ||
        element.getAttribute('log-all') ||
        'element_expose'
      const extraData = parseExtraData(element)

      trackExpose(eventName, {
        ...extraData,
        element_id: element.id || '',
        element_tag: element.tagName.toLowerCase(),
        element_class: element.className || ''
      })

      exposedElementsRef.current.add(element)
    },
    [trackExpose]
  )

  // 处理点击事件
  const handleClick = useCallback(
    (event: MouseEvent) => {
      // 从点击目标向上查找带有 log-click 或 log-all 属性的元素
      let target = event.target as HTMLElement | null

      while (target && target !== document.body) {
        const clickEventName = target.getAttribute('log-click')
        const allEventName = target.getAttribute('log-all')

        if (clickEventName || allEventName) {
          const eventName = clickEventName || allEventName || 'element_click'
          const extraData = parseExtraData(target)

          trackClick(eventName, target, {
            ...extraData,
            click_x: event.clientX,
            click_y: event.clientY
          })
          break
        }

        target = target.parentElement
      }
    },
    [trackClick]
  )

  // 设置 IntersectionObserver 监听曝光
  const setupExposeObserver = useCallback(() => {
    if (typeof window === 'undefined') return

    // 创建 IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleExpose(entry.target as HTMLElement)
          }
        })
      },
      {
        // 元素进入视口 50% 时触发
        threshold: 0.5,

        // 提前 100px 触发
        rootMargin: '100px'
      }
    )

    // 查找所有需要监听曝光的元素
    const exposeElements = document.querySelectorAll('[log-expose], [log-all]')
    exposeElements.forEach((element) => {
      observerRef.current?.observe(element)
    })
  }, [handleExpose])

  // 设置 MutationObserver 监听 DOM 变化
  const setupMutationObserver = useCallback(() => {
    if (typeof window === 'undefined') return

    mutationObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement

            // 检查新增元素是否需要监听曝光
            if (
              element.hasAttribute('log-expose') ||
              element.hasAttribute('log-all')
            ) {
              observerRef.current?.observe(element)
            }

            // 检查新增元素的子元素
            const childExposeElements = element.querySelectorAll(
              '[log-expose], [log-all]'
            )
            childExposeElements.forEach((child) => {
              observerRef.current?.observe(child)
            })
          }
        })
      })
    })

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true
    })
  }, [])

  // 初始化
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 延迟初始化，确保 DOM 已渲染
    const timer = setTimeout(() => {
      setupExposeObserver()
      setupMutationObserver()

      // 添加全局点击监听
      document.addEventListener('click', handleClick, true)

      // 追踪页面访问
      const deviceInfo = getDeviceInfo()
      trackCustom('page_view', {
        device_type: deviceInfo.device_type,
        source: deviceInfo.source,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        language: navigator.language
      })
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick, true)
      observerRef.current?.disconnect()
      mutationObserverRef.current?.disconnect()
    }
  }, [setupExposeObserver, setupMutationObserver, handleClick, trackCustom])

  // 使用 Next.js 的 usePathname 和 useSearchParams 监听路由变化
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 记录是否为首次渲染，避免与初始化 useEffect 重复上报
  const isFirstRenderRef = useRef(true)

  // 路由变化时重新扫描元素并上报 page_view
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 首次渲染跳过，因为初始化 useEffect 已经上报了 page_view
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    // 重置已曝光元素集合
    exposedElementsRef.current = new WeakSet()

    // 延迟扫描，等待 DOM 更新完成
    const timer = setTimeout(() => {
      const exposeElements = document.querySelectorAll(
        '[log-expose], [log-all]'
      )
      exposeElements.forEach((element) => {
        observerRef.current?.observe(element)
      })

      // 追踪新页面访问
      const deviceInfo = getDeviceInfo()
      trackCustom('page_view', {
        device_type: deviceInfo.device_type,
        source: deviceInfo.source,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        language: navigator.language
      })
    }, 200)

    return () => {
      clearTimeout(timer)
    }
    // pathname 或 searchParams 变化时触发（覆盖 Link 导航、router.push、浏览器前进后退）
  }, [pathname, searchParams, trackCustom])

  const contextValue = useMemo<TrackingContextValue>(
    () => ({
      trackExpose,
      trackClick,
      trackCustom,
      flush,
      getGUID
    }),
    [flush, getGUID, trackClick, trackCustom, trackExpose]
  )

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  )
}
