import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 生成 UUID v4
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8

    return v.toString(16)
  })
}

// 生成会话 ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export interface TrackingEvent {
  event_type: 'expose' | 'click' | 'custom'
  event_name: string
  element_id?: string
  element_tag?: string
  page_url: string
  page_title?: string
  referrer?: string
  extra_data?: Record<string, unknown>
  viewport?: string
  screen?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  session_id?: string
  timestamp?: string
}

export interface TrackingState {
  guid: string
  sessionId: string
  eventQueue: TrackingEvent[]
  isInitialized: boolean
}

export interface TrackingStore extends TrackingState {
  initGUID: () => string
  getGUID: () => string
  getSessionId: () => string
  addEvent: (event: Omit<TrackingEvent, 'session_id' | 'timestamp'>) => void
  flushEvents: () => TrackingEvent[]
  clearEvents: () => void
  setInitialized: (value: boolean) => void
}

export const useTrackingStore = create<TrackingStore>()(
  persist(
    (set, get) => ({
      guid: '',
      sessionId: '',
      eventQueue: [],
      isInitialized: false,

      // 初始化 GUID（首次访问时调用）
      initGUID: () => {
        const state = get()
        if (state.guid) {
          return state.guid
        }

        const newGUID = generateGUID()
        set({ guid: newGUID })
        return newGUID
      },

      // 获取 GUID
      getGUID: () => {
        const state = get()
        if (!state.guid) {
          return get().initGUID()
        }

        return state.guid
      },

      // 获取会话 ID（每次页面刷新生成新的）
      getSessionId: () => {
        const state = get()
        if (!state.sessionId) {
          const newSessionId = generateSessionId()
          set({ sessionId: newSessionId })
          return newSessionId
        }

        return state.sessionId
      },

      // 添加事件到队列
      addEvent: (event) => {
        const state = get()
        const fullEvent: TrackingEvent = {
          ...event,
          session_id: state.sessionId || get().getSessionId(),
          timestamp: new Date().toISOString()
        }
        set({ eventQueue: [...state.eventQueue, fullEvent] })
      },

      // 获取并清空事件队列
      flushEvents: () => {
        const events = get().eventQueue
        set({ eventQueue: [] })
        return events
      },

      // 清空事件队列
      clearEvents: () => {
        set({ eventQueue: [] })
      },

      // 设置初始化状态
      setInitialized: (value: boolean) => {
        set({ isInitialized: value })
      }
    }),
    {
      name: 'tracking-store',
      storage: createJSONStorage(() => localStorage),

      // 只持久化 guid，不持久化事件队列和会话 ID
      partialize: (state) => ({
        guid: state.guid
      })
    }
  )
)
