'use client'

import { SelfUser } from '@/components/common/user-card/User'
import { formatDate } from '@/utils/time'

import { AnnouncementDelete } from './AnnouncementDelete'
import { AnnouncementEdit } from './AnnouncementEdit'

import type { AdminAnnouncement } from '@/types/api/admin'

interface Props {
    announcement: AdminAnnouncement
    columnKey: string | number
    onUpdate?: (announcementId: number, updatedAnnouncement: Partial<AdminAnnouncement>) => void
    onDelete?: (announcementId: number) => void
}

export const RenderCell = ({ announcement, columnKey, onUpdate, onDelete }: Props) => {
  switch (columnKey) {
  case 'title':
    return (
      <div className="max-w-xs">
        <div className="font-medium truncate">{announcement.title}</div>
      </div>
    )

  case 'content':
    return (
      <div className="text-sm text-gray-500 line-clamp-2">
        {announcement.content}
      </div>
    )

  case 'user':
    return (
      <SelfUser
        user={announcement.user}
        userProps={{
          name: announcement.user.name,
          avatarProps: {
            src: announcement.user.avatar
          }
        }}
      />
    )
  case 'created':
    return (
      <div className="text-sm text-gray-500">
        {formatDate(announcement.created, { isShowYear: true })}
      </div>
    )
  case 'updated':
    return (
      <div className="text-sm text-gray-500">
        {formatDate(announcement.updated, { isShowYear: true })}
      </div>
    )
  case 'actions':
    return (
      <div className="flex gap-2">
        <AnnouncementEdit
          initialAnnouncement={announcement}
          onUpdate={onUpdate}
        />
        <AnnouncementDelete
          announcement={announcement}
          onDelete={onDelete}
        />
      </div>
    )
  default:
    return <div>-</div>
  }
} 