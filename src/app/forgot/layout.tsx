import { forgotMetadata } from '../metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = forgotMetadata

export default function ForgotLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
