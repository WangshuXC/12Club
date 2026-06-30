'use client'

import { Card, CardBody } from '@heroui/react'
import Link from 'next/link'

import { formatDistanceToNow } from '@/utils/formatDistanceToNow'

import { CategoryBadge } from './CategoryBadge'

import type { Message } from '@/types/api/message'

interface Props {
  message: Message
}

export const MessageItem = ({ message }: Props) => {
  const isUnread = message.status === 0

  const content = (
    <Card
      shadow="sm"
      classNames={{
        base: `w-full ${message.link ? 'cursor-pointer' : ''}`
      }}
    >
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryBadge type={message.type} />
            {isUnread && (
              <span
                className="inline-block size-2 rounded-full bg-danger"
                aria-label="未读"
              />
            )}
          </div>
          <span className="text-xs text-default-500">
            {formatDistanceToNow(message.created)}
          </span>
        </div>
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        {message.sender && (
          <div className="text-xs text-default-500">
            来自：{message.sender.name}
          </div>
        )}
      </CardBody>
    </Card>
  )

  if (message.link) {
    return (
      <Link href={message.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
