import { Suspense } from 'react'

import { Series } from '@/components/admin/series/Container'
import { ErrorComponent } from '@/components/common/Error'

import { GetSeriesActions } from './actions'

export const revalidate = 3

interface PageProps {
  searchParams: Promise<{
    query?: string
    page?: string
    limit?: string
    sortField?: string
    sortOrder?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  // 提取查询参数
  const params = await searchParams
  const query = params.query || ''
  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '9', 10)
  const sortField = params.sortField || 'updated'
  const sortOrder = params.sortOrder || 'desc'

  const response = await GetSeriesActions({
    page,
    limit,
    search: query || undefined,
    sortField: sortField as any,
    sortOrder: sortOrder as any
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Series
        initialSeries={response.series}
        initialTotal={response.total}
        initialQuery={query}
        initialPage={page}
        initialLimit={limit}
        initialSortField={sortField}
        initialSortOrder={sortOrder}
      />
    </Suspense>
  )
}
