'use client'

import { Card, CardBody, Avatar } from '@heroui/react'
import { ThumbsUp } from 'lucide-react'
import Link from 'next/link'

import { CommentContent } from '@/components/ui/CommentContent'
import { getRouteByDbId } from '@/utils/router'
import { formatDate } from '@/utils/time'

import { CommentEdit } from './CommentEdit'

import type { AdminComment } from '@/types/api/admin'

interface Props {
  comment: AdminComment
  onDelete: (commentId: number) => void
  onUpdate: (commentId: number, newContent: string) => void
}

export const CommentCard = ({ comment, onDelete, onUpdate }: Props) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex w-full gap-4">
            <Avatar name={comment.user.name} src={comment.user.avatar} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{comment.user.name}</h2>
                <span className="text-small text-default-500">
                  评论于{' '}
                  <Link
                    className="text-primary-500"
                    href={getRouteByDbId(comment.resource.dbId)}
                  >
                    {comment.resource.name}
                  </Link>
                </span>
              </div>
              <div className="mt-1">
                <CommentContent content={comment.content} />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-small text-default-500">
                  <ThumbsUp size={14} />
                  {comment.likeCount}
                </div>
                <span className="text-small text-default-500">
                  {formatDate(comment.created, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </span>
              </div>
            </div>
          </div>

          <CommentEdit
            initialComment={comment}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        </div>
      </CardBody>
    </Card>
  )
}
