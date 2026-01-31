import type { Metadata } from 'next'
import { NotFoundComponent } from '@/components/common/NotFound'
import { notFoundMetadata } from './metadata'

export const metadata: Metadata = notFoundMetadata

export default function NotFound() {
  return <NotFoundComponent />
}
