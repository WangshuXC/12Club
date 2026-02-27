/**
 * 自定义图片 Loader
 * 将 12club.nankai.edu.cn/openlist/d/... 的图片 URL 转发到 localhost:5244/d/...
 */

type ImageLoaderProps = {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({
  src,
  width,
  quality
}: ImageLoaderProps): string {
  // 检查是否是需要代理的 URL
  const proxyPattern = /^https?:\/\/12club\.nankai\.edu\.cn\/openlist\/d\/(.*)/
  const match = src.match(proxyPattern)

  if (match) {
    // 将 12club.nankai.edu.cn/openlist/d/... 转换为 localhost:5244/d/...
    const path = match[1]

    // 直接返回代理后的 URL（不通过 /_next/image）
    return `http://localhost:5244/d/${path}`
  }

  // 对于本地路径（以 / 开头），直接返回
  if (src.startsWith('/')) {
    return src
  }

  // 对于其他外部 URL，直接返回原始 URL
  return src
}
