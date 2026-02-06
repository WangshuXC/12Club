import { Suspense } from 'react'

import { Resource } from '@/components/admin/resource/Container'
import { ErrorComponent } from '@/components/common/Error'

import { GetActions } from './actions'

export const revalidate = 3

interface PageProps {
  searchParams: Promise<{ query: string | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  // 提取query参数
  const params = await searchParams
  const query = params.query || ''

  const response = await GetActions({
    page: 1,
    limit: 30,
    ...(query && { search: query })
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Resource
        initialResources={response.resources}
        initialTotal={response.total}
        initialQuery={query}
      />
    </Suspense>
  )
}
