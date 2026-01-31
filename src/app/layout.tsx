import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { clubViewport, clubMetadata } from './metadata'
import '@/styles/index.css'

import { ViewTransitions } from 'next-view-transitions'

import { Providers } from './providers'
import { TopBar } from '@/components/topBar'
import { BackToTop } from '@/components/common/BackToTop'
import { Footer } from '@/components/common/Footer'

export const viewport: Viewport = clubViewport

export const metadata: Metadata = clubMetadata

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="zh-Hans" suppressHydrationWarning>
        <body>
          <Providers>
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-radial">
              <TopBar />
              <div className="flex min-h-[calc(100dvh-256px)] max-w-7xl w-full grow px-3 sm:px-6">
                {children}
                <Toaster />
              </div>
              <BackToTop />
              <Footer />
            </div>
          </Providers>
          <script
            defer
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLICUMAMI_WEBSITE_ID}
          />
        </body>
      </html>
    </ViewTransitions>
  )
}
