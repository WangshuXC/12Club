'use client'

import { AppProgressBar } from 'next-nprogress-bar'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next-nprogress-bar'
import { TrackingProvider } from '@/components/tracking'

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  return (
    <HeroUIProvider navigate={router.push}>
      <ThemeProvider attribute="class">
        <TrackingProvider
          options={{
            flushInterval: 5000, // 每 5 秒上报一次
            flushThreshold: 10, // 队列满 10 条时上报
            debug: process.env.NODE_ENV === 'development' // 开发环境开启调试
          }}
        >
          {children}
        </TrackingProvider>
      </ThemeProvider>
      <AppProgressBar
        height="4px"
        color="rgb(14,165,233)"
        options={{ showSpinner: false }}
      />
      <ToastProvider toastOffset={50} placement="top-center" />
    </HeroUIProvider>
  )
}
