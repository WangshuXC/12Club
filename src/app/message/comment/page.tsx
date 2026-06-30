'use client'

import { useEffect } from 'react'

import { MessageList } from '@/components/message/MessageList'
import { useMessageStore } from '@/store/messageStore'
import { FetchPut } from '@/utils/fetch'

import type { MessageCategory } from '@/types/api/message'

const CATEGORY: MessageCategory = 'comment'

export default function CommentPage() {
  const fetchUnread = useMessageStore((s) => s.fetchUnread)

  useEffect(() => {
    FetchPut('/message/read', { category: CATEGORY })
      .catch(() => undefined)
      .finally(() => fetchUnread())
  }, [fetchUnread])

  return <MessageList category={CATEGORY} />
}
