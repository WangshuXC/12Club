'use client'

import { useEffect } from 'react'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { AppProgressBar } from 'next-nprogress-bar'
import { useRouter } from 'next-nprogress-bar'
import { ThemeProvider } from 'next-themes'

import { DeviceInitializer } from '@/components/common/DeviceInitializer'
import { TrackingProvider } from '@/components/tracking'
import { useUserStore } from '@/store/userStore'

import type { GlobalDeviceInfo } from '@/utils/device'

let aegis: unknown = null

interface ProvidersProps {
  children: React.ReactNode
  initialDeviceInfo: GlobalDeviceInfo
}

export const Providers = ({ children, initialDeviceInfo }: ProvidersProps) => {
  const router = useRouter()
  const { user } = useUserStore((state) => state)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || aegis) return

    let canceled = false

    void import('aegis-web-sdk')
      .then(({ default: Aegis }) => {
        if (aegis || canceled) return

        aegis = new Aegis({
          id: 'qVzOWuLoljDKmaX6Zq',
          uin: user.name + ' | ' + user.uid,
          reportApiSpeed: true,
          reportAssetSpeed: true,
          spa: true,
          hostUrl: 'https://rumt-zh.com'
        })
      })
      .catch(() => undefined)

    return () => {
      canceled = true
    }
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
