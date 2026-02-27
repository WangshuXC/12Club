export interface UserInfo {
  id: number
  requestUserUid: number
  name: string
  email: string
  avatar: string
  bio: string
  role: number
  status: number
  registerTime: string
  follower?: number
  following?: number
  isFollow?: boolean
  _count: {
    resource: number
    resource_patch: number
    resource_comment: number
    resource_favorite: number
  }
}

export interface UserComment {
  id: number
  resourceId: number
  dbId: string
  content: string
  like?: number
  userId: number
  resourceName: string
  created: string
  quotedUserUid?: number | null
  quotedUsername?: string | null
}

export interface UserResource {
  id: number
  patchUniqueId: string
  patchId: number
  patchName: string
  patchBanner: string
  size: string
  type: string[]
  language: string[]
  platform?: string[]
  created: string
  content: string
}

export interface UserFavoriteResourceFolder {
  id: number
  name: string
  description?: string
  is_public: boolean
  isAdd: boolean
  _count: { resource: number }
}
