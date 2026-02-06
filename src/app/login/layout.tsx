import { loginMetadata } from '../metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = loginMetadata

export default function LoginLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
