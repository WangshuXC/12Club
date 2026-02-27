'use client'

import { Chip } from '@heroui/react'

import { SelfUser } from '@/components/common/user-card/User'
import {
  USER_ROLE_MAP,
  USER_ROLE_COLOR_MAP,
  USER_STATUS_COLOR_MAP,
  USER_STATUS_MAP
} from '@/constants/user'
import { formatDate } from '@/utils/time'

import { UserDelete } from './UserDelete'
import { UserEdit } from './UserEdit'

import type { AdminUser as AdminUserType } from '@/types/api/admin'

export const RenderCell = (
  user: AdminUserType,
  columnKey: string,
  onUpdate?: (userId: number, updatedUser: Partial<AdminUserType>) => void,
  onDelete?: (userId: number) => void
) => {
  switch (columnKey) {
    case 'user':
      return (
        <SelfUser
          user={user}
          userProps={{
            name: user.name,
            description: user.email,
            avatarProps: {
              src: user.avatar
            }
          }}
        />
      )
    case 'resource':
      return <div className="text-sm text-gray-500">{user._count.resource}</div>
    case 'resource_patch':
      return (
        <div className="text-sm text-gray-500">
          {user._count.resource_patch}
        </div>
      )
    case 'email':
      return <div className="text-sm text-gray-500">{user.email}</div>
    case 'role':
      return (
        <Chip color={USER_ROLE_COLOR_MAP[user.role]} variant="flat">
          {USER_ROLE_MAP[user.role]}
        </Chip>
      )
    case 'status':
      return (
        <Chip color={USER_STATUS_COLOR_MAP[user.status]} variant="flat">
          {USER_STATUS_MAP[user.status]}
        </Chip>
      )
    case 'actions':
      return (
        <div className="flex items-center gap-2">
          <UserEdit initialUser={user} onUpdate={onUpdate} />
          <UserDelete user={user} onDelete={onDelete} />
        </div>
      )
    case 'created':
      return (
        <div className="text-sm text-gray-500">
          {formatDate(user.created, { isShowYear: true })}
        </div>
      )
    default:
      return (
        <Chip color="primary" variant="flat">
          咕咕咕
        </Chip>
      )
  }
}
