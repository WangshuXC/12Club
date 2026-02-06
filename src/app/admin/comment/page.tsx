import { Suspense } from 'react'

import { Comment } from '@/components/admin/comment/Container'
import { ErrorComponent } from '@/components/common/Error'

import { GetActions } from './actions'

export const revalidate = 3

export default async function CommentPage() {
  const response = await GetActions({
    page: 1,
    limit: 30
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Comment
        initialComments={response.comments}
        initialTotal={response.total}
      />
    </Suspense>
  )
}
