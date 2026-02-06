import { NotFoundComponent } from '@/components/common/NotFound'

import { notFoundMetadata } from './metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = notFoundMetadata

export default function NotFound() {
  return <NotFoundComponent />
}
