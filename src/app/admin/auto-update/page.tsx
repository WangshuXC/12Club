import { Suspense } from 'react'

import { AutoUpdateContainer } from '@/components/admin/auto-update/Container'
import { ErrorComponent } from '@/components/common/Error'

import { GetAutoUpdateActions } from './actions'

export const revalidate = 3

interface PageProps {
  searchParams: Promise<{ query: string | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  // 提取query参数
  const params = await searchParams
  const query = params.query || ''

  const response = await GetAutoUpdateActions({
    page: 1,
    limit: 30,
    ...(query && { search: query })
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <AutoUpdateContainer
        initialResources={response.resources}
        initialTotal={response.total}
        initialQuery={query}
      />
    </Suspense>
  )
}
