import type { Metadata } from 'next'
import { loginMetadata } from '../metadata'

export const metadata: Metadata = loginMetadata

export default function LoginLayout({
  children
}: {
  children: React.ReactNode
}) {
  return children
}
