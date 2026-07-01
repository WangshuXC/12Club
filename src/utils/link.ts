// 去除播放链接中的 http:// 或 https:// 前缀
export const removeHttpPrefix = (url: string) => {
  return url.replace(/^https?:/, '')
}

// 安全 decodeURI，失败时返回原文
export const safeDecodeURI = (url: string) => {
  try {
    return decodeURI(url)
  } catch {
    return url
  }
}
