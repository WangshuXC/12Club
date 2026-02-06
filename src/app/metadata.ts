import { Config } from '@/config/config'

import type { Metadata, Viewport } from 'next'

// ==================== Viewport 配置 ====================
export const clubViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'light dark'
}

// ==================== 基础 Metadata 配置 ====================
const SITE_NAME = Config.titleShort
const SITE_TITLE = Config.title
const SITE_URL = Config.url
const SITE_DESCRIPTION =
  '12Club 是南开大学 ACG 爱好者的综合性资源分享平台，提供动漫在线观看、漫画阅读、游戏下载、轻小说阅读等服务，致力于打造活跃的 ACG 文化交流社区。'

export const clubMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '12Club',
    '南开大学',
    'ACG',
    '动漫',
    '漫画',
    '轻小说',
    '游戏',
    'Galgame',
    '番剧',
    '资源分享'
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png'
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

// ==================== 页面 Metadata 工厂函数 ====================

/**
 * 创建页面 Metadata
 * @param title - 页面标题
 * @param description - 页面描述
 * @param path - 页面路径（用于 canonical URL）
 * @param extra - 额外的 Metadata 配置
 */
export const createMetadata = (
  title: string,
  description: string,
  path?: string,
  extra?: Partial<Metadata>
): Metadata => {
  const url = path ? `${SITE_URL}${path}` : undefined

  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website'
    },
    twitter: {
      card: 'summary',
      title,
      description
    },
    ...extra
  }
}

// ==================== 预定义的页面 Metadata ====================

/** 首页 Metadata */
export const homeMetadata: Metadata = createMetadata(
  SITE_TITLE,
  SITE_DESCRIPTION,
  '/'
)

/** 登录页 Metadata */
export const loginMetadata: Metadata = createMetadata(
  '登录',
  '登录 12Club 账号，访问更多功能和个性化内容',
  '/login'
)

/** 注册页 Metadata */
export const registerMetadata: Metadata = createMetadata(
  '注册',
  '注册 12Club 账号，加入南开大学 ACG 爱好者社区',
  '/register'
)

/** 忘记密码页 Metadata */
export const forgotMetadata: Metadata = createMetadata(
  '忘记密码',
  '重置您的 12Club 账号密码',
  '/forgot'
)

/** 搜索页 Metadata */
export const searchMetadata: Metadata = createMetadata(
  '搜索',
  '搜索动漫、漫画、游戏、轻小说等 ACG 资源',
  '/search'
)

/** 动漫列表页 Metadata */
export const animeMetadata: Metadata = createMetadata(
  '动漫',
  '浏览和观看动漫番剧，支持在线播放和下载',
  '/anime'
)

/** 漫画列表页 Metadata */
export const comicMetadata: Metadata = createMetadata(
  '漫画',
  '浏览和阅读精选漫画资源，涵盖日漫、国漫等多种类型',
  '/comic'
)

/** 游戏列表页 Metadata */
export const gameMetadata: Metadata = createMetadata(
  '游戏',
  '浏览和下载 Galgame、视觉小说等游戏资源',
  '/game'
)

/** 轻小说列表页 Metadata */
export const novelMetadata: Metadata = createMetadata(
  '轻小说',
  '浏览和阅读轻小说、网络文学等文字作品',
  '/novel'
)

/** 404 页面 Metadata */
export const notFoundMetadata: Metadata = createMetadata(
  '页面未找到',
  '抱歉，您访问的页面不存在',
  undefined,
  { robots: { index: false, follow: false } }
)

/** 管理后台 Metadata */
export const adminMetadata: Metadata = createMetadata(
  '管理后台',
  '12Club 网站管理后台',
  '/admin',
  { robots: { index: false, follow: false } }
)
