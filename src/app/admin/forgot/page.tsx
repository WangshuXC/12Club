import { Suspense } from 'react'

import { Forgot } from '@/components/admin/forgot'
import { ErrorComponent } from '@/components/common/Error'

import { getActions } from './actions'

export const revalidate = 3

export default async function AdminForgotPage() {
  const response = await getActions({
    page: 1,
    limit: 10
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Forgot
        initialResetCodes={response.resetCodes}
        initialTotal={response.total}
        initialStats={response.stats}
      />
    </Suspense>
  )
}
