import type { Metadata } from 'next'
import { forgotMetadata } from '../metadata'

export const metadata: Metadata = forgotMetadata

export default function ForgotLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
