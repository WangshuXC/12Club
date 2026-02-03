'use client'

import { create } from 'zustand'
import {
  type DeviceInfo,
  detectMobile,
  detectTablet
} from '@/utils/device'

// 重新导出类型供外部使用
export type { DeviceInfo }

export interface GlobalState {
  device: DeviceInfo
  isHydrated: boolean
}

export interface GlobalStore extends GlobalState {
  setDevice: (device: DeviceInfo) => void
  initDevice: () => void
  setHydrated: (hydrated: boolean) => void
}

// 获取设备信息（客户端）
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: ''
    }
  }

  const userAgent = navigator.userAgent
  const isMobile = detectMobile(userAgent)
  const isTablet = detectTablet(userAgent)
  const isDesktop = !isMobile && !isTablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent
  }
}

const initialState: GlobalState = {
  device: {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    userAgent: ''
  },
  isHydrated: false
}

export const useGlobalStore = create<GlobalStore>()((set) => ({
  ...initialState,
  setDevice: (device: DeviceInfo) => set({ device }),
  initDevice: () => {
    const device = getDeviceInfo()
    set({ device, isHydrated: true })
  },
  setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated })
}))
