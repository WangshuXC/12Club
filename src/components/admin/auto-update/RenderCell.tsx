import { Chip, Image, Button, Tooltip } from '@heroui/react'
import { Edit2 } from 'lucide-react'
import Link from 'next/link'

import { getRouteByDbId } from '@/utils/router'
import { formatDate } from '@/utils/time'

import { DeleteButton } from './DeleteButton'

import type { AutoUpdateResource } from '@/app/api/admin/auto-update/get'

export const RenderCell = (
  item: AutoUpdateResource,
  columnKey: string,
  onDelete: (id: number) => void
) => {
  switch (columnKey) {
    case 'banner':
      return (
        <Image
          src={item.resourceBanner}
          alt={item.resourceName}
          className="w-16 h-24 object-cover rounded"
        />
      )
    case 'name':
      return (
        <div className="flex flex-col gap-1">
          <Link
            href={getRouteByDbId(item.resourceDbId)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="font-semibold hover:text-primary">
              {item.resourceName}
            </p>
          </Link>
          <p className="text-xs text-foreground-500">{item.resourceDbId}</p>
        </div>
      )
    case 'status':
      return (
        <Chip color={item.status === 1 ? 'success' : 'default'} size="sm">
          {item.status === 1 ? '启用' : '禁用'}
        </Chip>
      )
    case 'accordionTotal':
      return <span>{item.accordionTotal || 0} 集</span>
    case 'lastUpdateTime':
      return (
        <span className="text-sm">
          {item.lastUpdateTime
            ? formatDate(item.lastUpdateTime, {
                isShowYear: true,
                isPrecise: true
              })
            : '未更新'}
        </span>
      )
    case 'actions':
      return (
        <div className="flex gap-2">
          <Link
            href={`/admin/resource?query=${item.resourceDbId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Tooltip content="前往编辑资源页面">
              <Button isIconOnly color="primary" variant="light" size="sm">
                <Edit2 className="w-4 h-4" />
              </Button>
            </Tooltip>
          </Link>
          <DeleteButton id={item.id} onDelete={onDelete} />
        </div>
      )
    default:
      return null
  }
}
