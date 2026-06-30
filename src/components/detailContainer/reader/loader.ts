import type { PlayListItem } from '@/types/common/detail-container'
import type { ReaderFormat, ReaderFile } from '@/types/common/reader'

// foliate-js 原生支持的格式（其余走 TxtReader 或提示不支持）
const FOLIATE_FORMATS: ReaderFormat[] = ['epub', 'mobi', 'azw3', 'fb2', 'cbz', 'pdf']

// 扩展名到阅读器格式的映射
const EXT_FORMAT_MAP: Record<string, ReaderFormat> = {
  epub: 'epub',
  mobi: 'mobi',
  azw: 'azw3',
  azw3: 'azw3',
  kf8: 'azw3',
  fb2: 'fb2',
  fbz: 'fb2',
  cbz: 'cbz',
  pdf: 'pdf',
  txt: 'txt'
}

// 去除 query / hash 后取文件名
const getPathname = (link: string): string => {
  const cleaned = link.split('#')[0].split('?')[0]
  const segments = cleaned.split('/')

  return segments[segments.length - 1] || cleaned
}

// 根据链接扩展名识别文件格式
export const detectFormat = (link: string): ReaderFormat => {
  const pathname = getPathname(link).toLowerCase()
  // 处理 .fb2.zip 这类复合扩展名
  if (pathname.endsWith('.fb2.zip')) {
    return 'fb2'
  }

  const dotIndex = pathname.lastIndexOf('.')
  if (dotIndex === -1) {
    return 'unknown'
  }

  const ext = pathname.slice(dotIndex + 1)

  return EXT_FORMAT_MAP[ext] ?? 'unknown'
}

// 是否为 foliate-js 内核支持的格式
export const isFoliateFormat = (format: ReaderFormat): boolean =>
  FOLIATE_FORMATS.includes(format)

// 从链接中提取文件名（供 foliate-js 通过文件名/后缀识别格式）
export const getFileName = (link: string): string => getPathname(link) || 'book'

// 将 playList 映射为可阅读文件列表
export const buildReaderFiles = (playList: PlayListItem[]): ReaderFile[] =>
  playList.map((item, index) => ({
    index,
    title: item.showAccordion || item.accordion.toString(),
    link: item.link,
    format: detectFormat(item.link)
  }))

// 动态加载 foliate-js 的 view.js，注册 <foliate-view> 自定义元素
// 使用 new Function 包装 import，绕过打包器（webpack/turbopack）的静态分析
export const loadFoliateView = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return
  }

  if (customElements.get('foliate-view')) {
    return
  }

  const dynamicImport = new Function(
    'url',
    'return import(url)'
  ) as (url: string) => Promise<unknown>
  await dynamicImport('/foliate-js/view.js')
  await customElements.whenDefined('foliate-view')
}

// 拉取远程文件为 File 对象（保留文件名以便 foliate-js 识别格式）
export const fetchFileAsFile = async (link: string): Promise<File> => {
  const res = await fetch(link)
  if (!res.ok) {
    throw new Error(`文件加载失败（${res.status}）`)
  }

  const blob = await res.blob()

  return new File([blob], getFileName(link), {
    type: blob.type || 'application/octet-stream'
  })
}

// 拉取远程文件为纯文本（供 TxtReader 使用）
export const fetchFileAsText = async (link: string): Promise<string> => {
  const res = await fetch(link)
  if (!res.ok) {
    throw new Error(`文件加载失败（${res.status}）`)
  }

  return res.text()
}
