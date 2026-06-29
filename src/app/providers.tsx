'use client'

import { useEffect } from 'react'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { AppProgressBar } from 'next-nprogress-bar'
import { useRouter } from 'next-nprogress-bar'
import { ThemeProvider } from 'next-themes'

import { DeviceInitializer } from '@/components/common/DeviceInitializer'
import { TrackingProvider } from '@/components/tracking'
import { readOrCreateGUIDSync } from '@/store/trackingStore'

import type { GlobalDeviceInfo } from '@/utils/device'

let aegis: unknown = null

// 未登录用户埋点 uin 前缀，与登录态 uid 区分
const GUEST_UIN_PREFIX = 'guest-'

interface ProvidersProps {
  children: React.ReactNode
  initialDeviceInfo: GlobalDeviceInfo
  initialUid: number | null
}

export const Providers = ({
  children,
  initialDeviceInfo,
  initialUid
}: ProvidersProps) => {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || aegis) return

    let canceled = false

    // 已登录使用 uid，未登录回落到 tracking 系统的 guid，保证 uin 始终有值
    const uin = initialUid
      ? String(initialUid)
      : `${GUEST_UIN_PREFIX}${readOrCreateGUIDSync()}`

    void import('aegis-web-sdk')
      .then(({ default: Aegis }) => {
        if (aegis || canceled) return

        aegis = new Aegis({
          id: 'qVzOWuLoljDKmaX6Zq',
          uin,
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
    // initialUid 来自 server 注入的一次性快照，整个生命周期内不变，依赖留空即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
