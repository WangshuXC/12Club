import { Suspense } from 'react'

import { SearchContainer } from '@/components/searchContainer'

import { searchMetadata } from '../metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = searchMetadata

export default function Search() {
  return (
    <Suspense>
      <SearchContainer />
    </Suspense>
  )
}
