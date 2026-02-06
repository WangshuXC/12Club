// 设备信息类型（用于 Tracking）
export interface DeviceInfo {
  device_type: string
  source: string
}

// 设备信息类型（用于 GlobalStore）
export interface GlobalDeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  userAgent: string
}

// 设备类型映射（用于显示）
export const DEVICE_TYPE_LABELS: Record<string, string> = {
  ios_phone: 'iPhone',
  ios_tablet: 'iPad',
  ios_ipod: 'iPod',
  android_phone: 'Android 手机',
  android_tablet: 'Android 平板',
  tablet: '平板',
  mobile_other: '其他移动设备',
  mac: 'Mac',
  windows: 'Windows',
  linux: 'Linux',
  desktop: '桌面设备'
}

// 来源类型映射（用于显示）
export const SOURCE_LABELS: Record<string, string> = {
  feishu: '飞书',
  wechat: '微信',
  google: 'Google',
  baidu: '百度',
  bing: 'Bing',
  direct: '直接访问',
  unknown: '未知'
}

/**
 * 从 User-Agent 解析设备类型
 * @param ua User-Agent 字符串
 * @returns 设备类型标识
 */
export const parseDeviceType = (ua: string): string => {
  if (!ua) return 'desktop'

  // iOS 设备
  if (/iPhone/i.test(ua)) {
    return 'ios_phone'
  } else if (/iPad/i.test(ua)) {
    return 'ios_tablet'
  } else if (/iPod/i.test(ua)) {
    return 'ios_ipod'
  }

  // Android 设备
  else if (/Android/i.test(ua)) {
    if (/Mobile/i.test(ua)) {
      return 'android_phone'
    } else {
      return 'android_tablet'
    }
  }

  // 其他平板
  else if (/(tablet|playbook|silk)/i.test(ua)) {
    return 'tablet'
  }

  // 其他移动设备
  else if (/blackberry|opera mini|iemobile|windows phone/i.test(ua)) {
    return 'mobile_other'
  }

  // Mac
  else if (/Macintosh/i.test(ua)) {
    return 'mac'
  }

  // Windows
  else if (/Windows/i.test(ua)) {
    return 'windows'
  }

  // Linux
  else if (/Linux/i.test(ua)) {
    return 'linux'
  }

  return 'desktop'
}

/**
 * 获取设备类型的显示标签
 * @param deviceType 设备类型标识
 * @returns 显示标签
 */
export const getDeviceTypeLabel = (deviceType: string): string => {
  return DEVICE_TYPE_LABELS[deviceType] || deviceType
}

/**
 * 从 User-Agent 解析并返回显示标签
 * @param ua User-Agent 字符串
 * @returns 设备类型显示标签
 */
export const parseUserAgentLabel = (ua: string | null): string => {
  if (!ua) return '未知设备'
  const deviceType = parseDeviceType(ua)

  return getDeviceTypeLabel(deviceType)
}

/**
 * 检测来源是否为飞书
 * @param ua User-Agent 字符串
 * @returns 是否为飞书内置浏览器
 */
export const isFeishuBrowser = (ua: string): boolean => {
  return ua.includes('Lark') || ua.includes('Feishu')
}

/**
 * 从 referrer 解析来源
 * @param referrer document.referrer
 * @returns 来源标识
 */
export const parseSource = (referrer: string): string => {
  if (!referrer) return 'direct'

  try {
    const referrerUrl = new URL(referrer)
    if (
      referrerUrl.hostname === 'feishu.nankai.edu.cn' ||
      referrerUrl.hostname.includes('feishu')
    ) {
      return 'feishu'
    } else if (
      referrerUrl.hostname.includes('weixin') ||
      referrerUrl.hostname.includes('qq.com')
    ) {
      return 'wechat'
    } else if (referrerUrl.hostname.includes('google')) {
      return 'google'
    } else if (referrerUrl.hostname.includes('baidu')) {
      return 'baidu'
    } else if (referrerUrl.hostname.includes('bing')) {
      return 'bing'
    } else {
      return referrerUrl.hostname
    }
  } catch {
    return 'unknown'
  }
}

/**
 * 获取来源的显示标签
 * @param source 来源标识
 * @returns 显示标签
 */
export const getSourceLabel = (source: string): string => {
  return SOURCE_LABELS[source] || source
}

/**
 * 获取完整的设备信息（仅客户端可用）
 * @returns 设备信息对象
 */
export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return { device_type: 'desktop', source: 'direct' }
  }

  const ua = navigator.userAgent

  // 解析来源
  let source = parseSource(document.referrer)

  // 检测是否在飞书内置浏览器中（优先级更高）
  if (isFeishuBrowser(ua)) {
    source = 'feishu'
  }

  // 解析设备类型
  const device_type = parseDeviceType(ua)

  return { device_type, source }
}

// ============================================
// 以下为 GlobalStore 使用的设备检测函数
// ============================================

/**
 * 检测是否为移动设备
 * @param ua User-Agent 字符串
 * @returns 是否为移动设备
 */
export const detectMobile = (ua: string): boolean => {
  return /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|windows phone/i.test(ua)
}

/**
 * 检测是否为平板设备
 * @param ua User-Agent 字符串
 * @returns 是否为平板设备
 */
export const detectTablet = (ua: string): boolean => {
  return /(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)
}

/**
 * 服务端获取设备信息（用于 SSR）
 * @param userAgent 请求头中的 User-Agent
 * @returns GlobalDeviceInfo 设备信息对象
 */
export const getServerDeviceInfo = (userAgent: string): GlobalDeviceInfo => {
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
