import { Suspense } from 'react'

import { User } from '@/components/admin/user'
import { ErrorComponent } from '@/components/common/Error'

import { getActions } from './actions'

export const revalidate = 3

export default async function UserPage() {
  const response = await getActions({
    page: 1,
    limit: 30
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <User initialUsers={response.users} initialTotal={response.total} />
    </Suspense>
  )
}
