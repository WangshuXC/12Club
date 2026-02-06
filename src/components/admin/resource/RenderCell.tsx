'use client'

import { Chip, Image, Badge } from '@heroui/react'
import { Tooltip } from '@heroui/react'
import { Eye, Download, MessageSquare, Heart } from 'lucide-react'
import Link from 'next/link'

import { SelfUser } from '@/components/common/user-card/User'
import { TYPE_CHINESE_MAP } from '@/constants/resource'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/utils/formatNumber'
import { getRouteByDbId, getResourceTypeByDbId } from '@/utils/router'
import { formatDistanceToNow } from '@/utils/time'

import { ResourceDelete } from './ResourceDelete'
import { ResourceEdit } from './ResourceEdit'
import { RewriteResourceBanner } from './RewriteResourceBanner'

import type { AdminResource } from '@/types/api/admin'

export const RenderCell = (
  resource: AdminResource,
  columnKey: string,
  onDelete?: (resourceId: number) => void,
  onUpdate?: (resourceId: number, updatedResource: Partial<AdminResource>) => void
) => {
  switch (columnKey) {
  case 'banner':
    return (
      <div>
        <Badge
          color={'primary'}
          variant="solid"
          showOutline={false}
          isInvisible={!(resource.dbId.startsWith('a') && resource.status === 1)}
          content={'完结'}
        >
          <Image
            alt={resource.name}
            className="object-cover rounded-none min-w-24"
            width={90}
            src={resource.banner}
            style={{ aspectRatio: '3/4' }}
          />
        </Badge>
        <RewriteResourceBanner resourceId={resource.id} />
      </div >
    )
  case 'name':
    return (
      <Link
        href={getRouteByDbId(resource.dbId)}
        className="font-medium hover:text-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p className="truncate">{resource.name}</p>
        <p className="text-xs text-gray-400">{resource.dbId}</p>
        <p className={cn('text-xs text-gray-400', getResourceTypeByDbId(resource.dbId) === 'anime' && 'text-primary')}>{TYPE_CHINESE_MAP[getResourceTypeByDbId(resource.dbId) as keyof typeof TYPE_CHINESE_MAP]}</p>
      </Link>
    )
  case 'user':
    return (
      <SelfUser
        user={resource.user}
        userProps={{
          name: resource.user.name,
          avatarProps: {
            src: resource.user.avatar
          }
        }}
      />
    )
  case 'created':
    return (
      <Chip size="sm" variant="light">
        {formatDistanceToNow(resource.created)}
      </Chip>
    )
  case 'actions':
    return (
      <div className="flex items-center gap-2">
        <ResourceEdit
          initialResource={resource}
          onUpdate={onUpdate}
        />
        <ResourceDelete
          resource={resource}
          onDelete={onDelete}
        />
      </div>
    )
  case 'status':
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-4 justify-start text-sm text-default-500 min-w-32'
        )}
      >
        <Tooltip content="浏览数" placement="bottom">
          <div className="flex items-center gap-1">
            <Eye className="size-4 min-w-4" />
            <span>{formatNumber(resource.view || 0)}</span>
          </div>
        </Tooltip>

        <Tooltip content="下载数" placement="bottom">
          <div className="flex items-center gap-1">
            <Download className="size-4 min-w-4" />
            <span>{formatNumber(resource.download || 0)}</span>
          </div>
        </Tooltip>

        <Tooltip content="评论数" placement="bottom">
          <div className="flex items-center gap-1">
            <MessageSquare className="size-4 min-w-4" />
            <span>{formatNumber(resource.comment || 0)}</span>
          </div>
        </Tooltip>

        <Tooltip content="收藏数" placement="bottom">
          <div className="flex items-center gap-1">
            <Heart className="size-4 min-w-4" />
            <span>{formatNumber(resource.favorite_by || 0)}</span>
          </div>
        </Tooltip>
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
