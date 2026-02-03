export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent: string
}

// 检测是否为移动设备
export function detectMobile(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  )
}

// 检测是否为平板设备
export function detectTablet(userAgent: string): boolean {
  return /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent)
}

// 服务端使用的设备检测函数
export function getServerDeviceInfo(userAgent: string): DeviceInfo {
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
