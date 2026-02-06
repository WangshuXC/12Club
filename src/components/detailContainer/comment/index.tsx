'use client'

import { Card, CardBody, CardHeader } from '@heroui/react'

import { Comments } from './Comments'

interface Props {
  id: string
  shouldFetchComment: boolean
}

export const CommentTab = ({ id, shouldFetchComment }: Props) => {
  return (
    <Card className="p-1 xl:p-8">
      <CardHeader className="p-4">
        <h2 className="text-2xl font-medium">用户评论</h2>
      </CardHeader>
      <CardBody className="p-4">
        <Comments id={id} shouldFetchComment={shouldFetchComment} />
      </CardBody>
    </Card>
  )
}
