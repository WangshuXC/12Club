import { UserResource } from '@/components/user/resource/Container'
import { kunGetActions } from './actions'
import { ErrorComponent } from '@/components/common/Error'
import { Suspense } from 'react'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export default async function Kun({ params }: Props) {
  const { id } = await params

  const response = await kunGetActions({
    uid: Number(id),
    page: 1,
    limit: 20
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <UserResource
        resources={response.resources}
        total={response.total}
        uid={Number(id)}
      />
    </Suspense>
  )
}
