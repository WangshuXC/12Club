export const dynamic = 'force-dynamic'

export const revalidate = 0
import { Suspense } from 'react'

import { ErrorComponent } from '@/components/common/Error'
import { PageContainer } from '@/components/pageContainer'

import { comicMetadata } from '../metadata'

import { getPageResourceActions } from './actions'

import type { QueryParams } from '@/types/common/page'
import type { Metadata } from 'next'

export const metadata: Metadata = comicMetadata

interface Props {
  searchParams?: Promise<QueryParams>
}

export default async function Page({ searchParams }: Props) {
  const res = await searchParams
  const currentPage = res?.page ? res.page : 1
  const sortField = res?.sortField ? res.sortField : 'updated'
  const sortOrder = res?.sortOrder ? res.sortOrder : 'desc'

  const selectedType = res?.type ? res.type : 'all'
  const selectedLanguage = res?.language ? res.language : 'all'
  const selectedStatus = res?.status ? res.status : 'all'
  const response = await getPageResourceActions({
    category: 'comic',
    selectedType,
    selectedLanguage,
    selectedStatus,
    sortField,
    sortOrder,
    page: currentPage,
    limit: 24
  })
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <div className="container py-6 mx-auto">
        <PageContainer
          category="comic"
          initPageData={response._data}
          initTotal={response.total}
        />
      </div>
    </Suspense>
  )
}
