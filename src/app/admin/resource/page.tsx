import { Suspense } from 'react'

import { Resource } from '@/components/admin/resource/Container'
import { ErrorComponent } from '@/components/common/Error'

import { GetActions } from './actions'

import type { SortField, SortOrder } from '@/components/pageContainer/sort'

export const revalidate = 3

const RESOURCE_TYPES = ['a', 'c', 'g', 'n'] as const

type ResourceType = (typeof RESOURCE_TYPES)[number]

const SORT_FIELDS: SortField[] = [
  'created',
  'view',
  'download',
  'favorite_by',
  'comment',
  'updated',
  'released'
]

interface PageProps {
  searchParams: Promise<{
    query?: string
    page?: string
    types?: string
    sortField?: string
    sortOrder?: string
  }>
}

const parsePage = (page?: string) => {
  const value = Number(page)

  return Number.isInteger(value) && value > 0 ? value : 1
}

const parseTypes = (types?: string): ResourceType[] => {
  if (!types) return [...RESOURCE_TYPES]

  const parsedTypes = types
    .split(',')
    .filter((type): type is ResourceType =>
      RESOURCE_TYPES.includes(type as ResourceType)
    )

  return parsedTypes.length > 0 ? parsedTypes : [...RESOURCE_TYPES]
}

const parseSortField = (sortField?: string): SortField => {
  return SORT_FIELDS.includes(sortField as SortField)
    ? (sortField as SortField)
    : 'updated'
}

const parseSortOrder = (sortOrder?: string): SortOrder => {
  return sortOrder === 'asc' ? 'asc' : 'desc'
}

export default async function Page({ searchParams }: PageProps) {
  // 提取query参数
  const params = await searchParams
  const query = params.query || ''
  const page = parsePage(params.page)
  const types = parseTypes(params.types)
  const sortField = parseSortField(params.sortField)
  const sortOrder = parseSortOrder(params.sortOrder)
  const filterTypes = types.length < RESOURCE_TYPES.length ? types : undefined

  const response = await GetActions({
    page,
    limit: 30,
    sortField,
    sortOrder,
    ...(query && { search: query }),
    ...(filterTypes && { types: filterTypes })
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
        initialPage={page}
        initialTypes={types}
        initialSortField={sortField}
        initialSortOrder={sortOrder}
      />
    </Suspense>
  )
}
