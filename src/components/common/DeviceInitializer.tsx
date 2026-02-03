'use client'

import { useEffect } from 'react'
import { useGlobalStore } from '@/store/globalStore'
import type { DeviceInfo } from '@/utils/device'

interface DeviceInitializerProps {
  initialDeviceInfo: DeviceInfo
}

export const DeviceInitializer = ({
  initialDeviceInfo
}: DeviceInitializerProps) => {
  const setDevice = useGlobalStore((state) => state.setDevice)
  const setHydrated = useGlobalStore((state) => state.setHydrated)

  useEffect(() => {
    // 使用服务端传递的设备信息初始化 store
    setDevice(initialDeviceInfo)
    setHydrated(true)
  }, [initialDeviceInfo, setDevice, setHydrated])

  return null
}
