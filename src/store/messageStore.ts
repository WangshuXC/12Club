import { create } from 'zustand'

import { FetchGet } from '@/utils/fetch'

import type {
  MessageCategory,
  UnreadCountData
} from '@/types/api/message'

// 运行时未读快照，不持久化以避免跨账号泄漏
const initialUnread: UnreadCountData = {
  notice: 0,
  update: 0,
  comment: 0,
  total: 0
}

interface MessageStore {
  unread: UnreadCountData
  setUnread: (unread: UnreadCountData) => void
  clearCategory: (category: MessageCategory) => void
  fetchUnread: () => Promise<void>
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
  unread: initialUnread,
  setUnread: (unread) => set({ unread }),
  clearCategory: (category) => {
    const current = get().unread
    const next: UnreadCountData = { ...current, [category]: 0 }
    next.total = next.notice + next.update + next.comment
    set({ unread: next })
  },
  fetchUnread: async () => {
    try {
      const res = await FetchGet<UnreadCountData>('/message/unread')
      if (typeof res === 'string') {
        console.warn('未读消息数获取失败:', res)
        return
      }
      set({ unread: res })
    } catch (error) {
      console.warn('未读消息数请求异常:', error)
    }
  }
}))
