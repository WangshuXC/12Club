'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { Pagination } from '@heroui/react'

import { getPageResourceActions } from '@/app/anime/actions'
import FadeContent from '@/components/ui/FadeContent'

import { scrollToTop } from '../common/BackToTop'
import { CoverCard } from '../common/CoverCard'

import { FilterBar } from './FilterBar'

import type { SortField, SortOrder } from './sort'
import type { PageData } from '@/types/api/page'

export const PageContainer = ({
  initPageData,
  initTotal,
  category
}: {
  initPageData: PageData[]
  initTotal: number
  category: string
}) => {
  const [total, setTotal] = useState(initTotal)
  const [pageData, setPageData] = useState<PageData[]>(initPageData)
  const [, startTransition] = useTransition()

  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)

  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    startTransition(async () => {
      const response = await getPageResourceActions({
        category,
        selectedType,
        selectedLanguage,
        selectedStatus,
        sortField,
        sortOrder,
        page,
        limit: 24
      })
      if (typeof response !== 'string') {
        setPageData(response._data)
        setTotal(response.total)
      }
    })
  }, [
    category,
    selectedType,
    selectedLanguage,
    selectedStatus,
    sortField,
    sortOrder,
    page
  ])

  return (
    <div className="container mx-auto my-4 space-y-6">
      <FilterBar
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        page={page}
        setPage={setPage}
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 scrollbar-hide">
        {pageData?.map((data, index) => (
          <FadeContent
            key={index}
            blur={false}
            duration={800}
            easing="ease-in-out"
            initialOpacity={0}
          >
            <CoverCard data={data} />
          </FadeContent>
        ))}
      </div>

      {total > 24 && (
        <div className="flex justify-center">
          <Pagination
            initialPage={1}
            page={page}
            loop
            size="lg"
            total={Math.ceil(total / 24)}
            onChange={(page) => {
              setPage(page)
              scrollToTop()
            }}
          />
        </div>
      )}
    </div>
  )
}
