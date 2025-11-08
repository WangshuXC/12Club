import type { ResourceComment } from './comment'
import type { Message } from './message'

export interface OverviewData {
  newUser: number
  newActiveUser: number
  newResource: number
  newResourcePatch: number
  newComment: number
}

export interface SumData {
  userCount: number
  resourceCount: number
  resourcePatchCount: number
  commentCount: number
}

export interface AdminUser {
  id: number
  name: string
  bio: string
  avatar: string
  role: number
  status: number
  created: Date | string
  email: string
  _count: {
    resource: number
    resource_patch: number
  }
}

export interface AdminComment {
  id: number
  userId: number
  resourceId: number
  content: string
  created: Date
  user: {
    id: number
    name: string
    avatar: string
  }
  resource: {
    name: string
    dbId: string
  }
  likeCount: number
  parentId?: number
}

export interface AdminFeedback extends Message {
  basicId?: number
  replies?: Message[]
}

export interface AdminReport extends Message {
  basicId?: number
  replies?: Message[]
}

export interface AdminResource {
  id: number
  dbId: string
  name: string
  banner: string
  created: Date | string
  author: string
  translator: string
  user: {
    id: number
    name: string
    avatar: string
  }
  introduction: string
  released: string
  accordionTotal: number
  language: string  // 修改为单个string，与edit保持一致
  type: string[]
  status: number
  download: number
  view: number
  comment: number
  favorite_by: number
  aliases?: string[]  // 修改为string[]，与edit保持一致
  tags?: string[]  // 资源标签
}

export interface AdminAnnouncement {
  id: number
  title: string
  content: string
  created: Date
  updated: Date
  user: {
    id: number
    name: string
    avatar: string
  }
}

export interface SystemInfo {
  cpu: {
    usage: number
    model: string
    cores: number
  }
  memory: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
  disk: {
    total: number
    used: number
    free: number
    usagePercent: number
  }
  diskPartitions: Array<{
    fs: string
    type: string
    size: number
    used: number
    available: number
    usagePercent: number
    mount: string
  }>
  uptime: number
  platform: string
  distro: string
  release: string
}

export interface AdminNotificationData {
  passwordResets: number
  feedbacks: number
  reports: number
  total: number
}