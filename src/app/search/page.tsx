import type { Metadata } from 'next'
import { SearchContainer } from '@/components/searchContainer'
import { Suspense } from 'react'
import { searchMetadata } from '../metadata'

export const metadata: Metadata = searchMetadata

export default function Search() {
  return (
    <Suspense>
      <SearchContainer />
    </Suspense>
  )
}
