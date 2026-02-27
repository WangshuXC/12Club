import { User } from '@/types/user'

export interface Introduction {
  text: string
  created: string // 发布时间
  updated: string // 更新时间
  released?: string // 发售时间，可选
  dbId?: string // DB ID，可选
  alias: string[] // 游戏别名列表
  tags: TagItem[] // 资源标签列表
  playList: PlayListItem[]
  isFavorite?: boolean
  _count: {
    view: number
    download: number
    comment: number
    favorited: number
  }
}

export interface TagItem {
  name: string
  count: number
}

export interface Cover {
  title: string
  author: string
  translator: string
  image: string
}

export interface PlayListItem {
  accordion: number
  showAccordion: string
  link: string
}
