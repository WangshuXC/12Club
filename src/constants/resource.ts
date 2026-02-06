export const SUPPORTED_TYPE = [
  'battle',
  'romance',
  'action',
  'sci_fi',
  'mystery',
  'comedy',
  'horror',
  'fantasy',
  'school',
  'other'
]

export const SUPPORTED_TYPE_MAP: Record<string, string> = {
  all: '全部类型',
  battle: '热血',
  romance: '恋爱',
  action: '动作',
  sci_fi: '科幻',
  mystery: '悬疑',
  comedy: '喜剧',
  horror: '恐怖',
  fantasy: '奇幻',
  school: '校园',
  other: '其他'
}

export const ALL_SUPPORTED_TYPE = ['all', ...SUPPORTED_TYPE]

export const SUPPORTED_RESOURCE_TYPE = ['anime', 'comic', 'game', 'novel']

export const SUPPORTED_RESOURCE_TYPE_MAP: Record<string, string> = {
  anime: '动漫',
  comic: '漫画',
  game: '游戏',
  novel: '小说'
}

export const SUPPORTED_LANGUAGE = ['zh', 'jp', 'en', 'other']

export const ALL_SUPPORTED_LANGUAGE = ['all', ...SUPPORTED_LANGUAGE]

export const SUPPORTED_LANGUAGE_MAP: Record<string, string> = {
  all: '全部语言',
  zh: '中文',
  jp: '日本語',
  en: 'English',
  other: '其它'
}

export const SUPPORTED_STATUS = ['0', '1', '2']

export const ALL_SUPPORTED_STATUS = ['all', ...SUPPORTED_STATUS]

export const SUPPORTED_STATUS_MAP: Record<string, string> = {
  all: '全部',
  0: '未完结',
  1: '已完结',
  2: '老站资源'
}

export const SUPPORTED_RESOURCE_LINK_MAP: Record<string, string> = {
  alist: '12club资源盘下载',
  user: '自定义链接下载'
}

export const storageTypes = [
  {
    value: 'alist',
    label: '12club 资源盘 (官方可用)',
    description: '此选项用于官方发布下载资源'
  },
  {
    value: 'user',
    label: '自定义链接 (>100MB)',
    description: '此选项适合 >100MB 的资源, 这需要您自行提供下载链接'
  }
]

export const SUPPORTED_RESOURCE_SECTION = ['club', 'individual']

export const RESOURCE_SECTION_MAP: Record<string, string> = {
  club: '12club 官方资源',
  individual: '个人资源'
}

export const SUPPORTED_RESOURCE_LINK = ['alist', 'user']

export const SORT_FIELD_LABEL_MAP: Record<string, string> = {
  updated: '更新时间',
  created: '发布时间',
  released: '发行时间',
  view: '浏览量',
  download: '下载量',
  favorite_by: '收藏量',
  comment: '评论量'
}

export const ROUTER_MAP = {
  a: 'anime',
  c: 'comic',
  g: 'game',
  n: 'novel'
} as const

export const TYPE_CHINESE_MAP = {
  anime: '动漫',
  comic: '漫画',
  game: '游戏',
  novel: '小说'
}

export const TYPE_MAP = {
  anime: 'a',
  comic: 'c',
  game: 'g',
  novel: 'n'
}

export type RouterPrefix = keyof typeof ROUTER_MAP
