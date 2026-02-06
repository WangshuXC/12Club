'use client'

import { Avatar, Button, Card, CardBody, CardFooter, Chip } from '@heroui/react'
import Link from 'next/link'

import { formatDate } from '@/utils/time'

import { FeedbackHandler } from './FeedbackHandler'

import type { AdminFeedback } from '@/types/api/admin'

interface Props {
  feedback: AdminFeedback
}

export const FeedbackCard = ({ feedback }: Props) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar
              name={feedback.sender!.name}
              src={feedback.sender!.avatar}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{feedback.sender?.name}</h2>
                <span className="text-small text-default-500">
                  {formatDate(feedback.created, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{feedback.content}</p>
              {feedback?.replies?.length ? (
                <div className="bg-primary/20 p-2 rounded-xl mt-2 flex flex-col gap-2">
                  {feedback.replies?.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-4">
                      <Avatar
                        classNames={{
                          base: 'w-10 h-10 min-w-10 min-h-10'
                        }}
                        name={reply.sender!.name}
                        src={reply.sender!.avatar}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{reply.sender!.name}</p>
                          <span className="text-small text-default-500">
                            {formatDate(reply.created, {
                              isPrecise: true,
                              isShowYear: true
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <FeedbackHandler initialFeedback={feedback} />
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex items-center gap-4 mt-2">
          <Chip
            color={feedback.status ? 'success' : 'danger'}
            variant="flat"
          >
            {feedback.status ? '已处理' : '未处理'}
          </Chip>
          <Button
            as={Link}
            size="sm"
            color="primary"
            variant="flat"
            href={feedback.link}
          >
            前往资源
          </Button>
          <Button
            as={Link}
            size="sm"
            color="primary"
            variant="flat"
            href={`/user/${feedback.sender?.id}/resource`}
          >
            前往用户
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
