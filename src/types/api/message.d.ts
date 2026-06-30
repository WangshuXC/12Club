import { MESSAGE_TYPE } from '@/constants/message'

import type { _User } from '@/types/user'

export type MessageCategory = 'notice' | 'update' | 'comment'

export interface Message {
  id: number
  type: (typeof MESSAGE_TYPE)[number]
  content: string
  status: number
  link: string
  created: string | Date
  sender: _User | null
}

export interface CreateMessageType {
  type: (typeof MESSAGE_TYPE)[number]
  content: string
  link: string
  sender_id?: number
  recipient_id?: number
  basic_id?: number
}

export interface UnreadCountData {
  notice: number
  update: number
  comment: number
  total: number
}

export interface MessageListResponse {
  messages: Message[]
  total: number
}
