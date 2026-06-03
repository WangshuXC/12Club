'use client'

import { useEffect } from 'react'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import Aegis from 'aegis-web-sdk'
import { AppProgressBar } from 'next-nprogress-bar'
import { useRouter } from 'next-nprogress-bar'
import { ThemeProvider } from 'next-themes'

import { DeviceInitializer } from '@/components/common/DeviceInitializer'
import { TrackingProvider } from '@/components/tracking'

import type { GlobalDeviceInfo } from '@/utils/device'

let aegis: Aegis | null = null

interface ProvidersProps {
  children: React.ReactNode
  initialDeviceInfo: GlobalDeviceInfo
}

export const Providers = ({ children, initialDeviceInfo }: ProvidersProps) => {
  const router = useRouter()

  useEffect(() => {
    if (aegis) return

    aegis = new Aegis({
      id: 'kwEOrCK47396deVdD3',
      reportApiSpeed: true,
      reportAssetSpeed: true,
      spa: true,
      hostUrl: 'https://rumt-zh.com'
    })
  }, [])

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
