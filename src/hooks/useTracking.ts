'use client'

import { useCallback, useRef, useEffect } from 'react'

import { useTrackingStore, TrackingEvent } from '@/store/trackingStore'

// 设备类型检测
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop'

  const ua = navigator.userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }

  if (
    /mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)
  ) {
    return 'mobile'
  }

  return 'desktop'
}

// 获取视口大小
const getViewport = (): string => {
  if (typeof window === 'undefined') return ''
  return `${window.innerWidth}x${window.innerHeight}`
}

// 获取屏幕分辨率
const getScreen = (): string => {
  if (typeof window === 'undefined') return ''
  return `${window.screen.width}x${window.screen.height}`
}

// 上报 API
const reportEvents = async (guid: string, events: TrackingEvent[]) => {
  if (events.length === 0) return

  try {
    const response = await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ guid, events }),

      // 使用 keepalive 确保页面关闭时也能发送
      keepalive: true
    })

    if (!response.ok) {
      console.error('Tracking report failed:', response.status)
    }
  } catch (error) {
    console.error('Tracking report error:', error)
  }
}

export interface UseTrackingOptions {

  // 批量上报的间隔时间（毫秒）
  flushInterval?: number

  // 队列达到多少条时触发上报
  flushThreshold?: number

  // 是否启用调试模式
  debug?: boolean
}

export const useTracking = (options: UseTrackingOptions = {}) => {
  const { flushInterval = 5000, flushThreshold = 10, debug = false } = options

  const {
    getGUID,
    getSessionId,
    addEvent,
    flushEvents,
    eventQueue,
    isInitialized,
    setInitialized
  } = useTrackingStore()

  const flushTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 获取公共属性
  const getCommonProps = useCallback(() => {
    return {
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      viewport: getViewport(),
      screen: getScreen(),
      device_type: getDeviceType()
    }
  }, [])

  // 立即上报
  const flush = useCallback(async () => {
    const events = flushEvents()
    if (events.length > 0) {
      const guid = getGUID()
      if (debug) {
        console.log('[Tracking] Flushing events:', events)
      }

      await reportEvents(guid, events)
    }
  }, [flushEvents, getGUID, debug])

  // 追踪曝光事件
  const trackExpose = useCallback(
    (eventName: string, extraData?: Record<string, unknown>) => {
      const event: Omit<TrackingEvent, 'session_id' | 'timestamp'> = {
        event_type: 'expose',
        event_name: eventName,
        ...getCommonProps(),
        extra_data: extraData
      }
      addEvent(event)

      if (debug) {
        console.log('[Tracking] Expose:', event)
      }
    },
    [addEvent, getCommonProps, debug]
  )

  // 追踪点击事件
  const trackClick = useCallback(
    (
      eventName: string,
      element?: HTMLElement,
      extraData?: Record<string, unknown>
    ) => {
      const event: Omit<TrackingEvent, 'session_id' | 'timestamp'> = {
        event_type: 'click',
        event_name: eventName,
        element_id: element?.id || '',
        element_tag: element?.tagName?.toLowerCase() || '',
        ...getCommonProps(),
        extra_data: extraData
      }
      addEvent(event)

      if (debug) {
        console.log('[Tracking] Click:', event)
      }
    },
    [addEvent, getCommonProps, debug]
  )

  // 追踪自定义事件
  const trackCustom = useCallback(
    (eventName: string, extraData?: Record<string, unknown>) => {
      const event: Omit<TrackingEvent, 'session_id' | 'timestamp'> = {
        event_type: 'custom',
        event_name: eventName,
        ...getCommonProps(),
        extra_data: extraData
      }
      addEvent(event)

      if (debug) {
        console.log('[Tracking] Custom:', event)
      }
    },
    [addEvent, getCommonProps, debug]
  )

  // 初始化
  useEffect(() => {
    if (!isInitialized) {
      getGUID()
      getSessionId()
      setInitialized(true)
    }
  }, [isInitialized, getGUID, getSessionId, setInitialized])

  // 定时上报
  useEffect(() => {
    flushTimerRef.current = setInterval(() => {
      flush()
    }, flushInterval)

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current)
      }
    }
  }, [flush, flushInterval])

  // 队列阈值触发上报
  useEffect(() => {
    if (eventQueue.length >= flushThreshold) {
      flush()
    }
  }, [eventQueue.length, flushThreshold, flush])

  // 页面卸载时上报
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  }, [flush])

  return {
    trackExpose,
    trackClick,
    trackCustom,
    flush,
    getGUID,
    getSessionId
  }
}
