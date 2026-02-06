'use client'

import { AppProgressBar } from 'next-nprogress-bar'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next-nprogress-bar'
import { TrackingProvider } from '@/components/tracking'
import { DeviceInitializer } from '@/components/common/DeviceInitializer'
import type { GlobalDeviceInfo } from '@/utils/device'

interface ProvidersProps {
  children: React.ReactNode
  initialDeviceInfo: GlobalDeviceInfo
}

export const Providers = ({ children, initialDeviceInfo }: ProvidersProps) => {
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
          <DeviceInitializer initialDeviceInfo={initialDeviceInfo} />
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
