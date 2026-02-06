import { registerMetadata } from '../metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = registerMetadata

export default function RegisterLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
