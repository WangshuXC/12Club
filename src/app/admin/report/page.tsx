import { Suspense } from 'react'

import { Report } from '@/components/admin/report'
import { ErrorComponent } from '@/components/common/Error'

import { getActions } from './actions'

export const revalidate = 3

export default async function Page() {
  const response = await getActions({
    page: 1,
    limit: 30
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Report initialReports={response.reports} total={response.total} />
    </Suspense>
  )
}
