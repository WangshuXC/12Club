'use client'

import type { JSX } from 'react'

import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import {
  Cloud,
  Database,
  Download,
  Edit,
  Link as LinkIcon,
  MoreHorizontal,
  Trash2
} from 'lucide-react'

import { ExternalLink } from '@/components/common/ExternalLink'
import { SUPPORTED_RESOURCE_LINK_MAP } from '@/constants/resource'
import { useUserStore } from '@/store/userStore'

import type { PatchResource } from '@/types/api/patch'

const storageIcons: { [key: string]: JSX.Element } = {
  alist: <Cloud className="size-4" />,
  user: <LinkIcon className="size-4" />
}

interface ResourceItemProps {
  resource: PatchResource
  showLinks: boolean
  onEdit: (resource: PatchResource) => void
  onDelete: (id: number) => void
  onDownload: (resource: PatchResource) => void
}

export const ResourceItem = ({
  resource,
  showLinks,
  onEdit,
  onDelete,
  onDownload
}: ResourceItemProps) => {
  const { user } = useUserStore((state) => state)

  return (
    <div className="p-3 rounded-lg bg-default-50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {resource.name}
          </p>
          {resource.note && (
            <p className="text-xs text-default-500 mt-1 line-clamp-2">
              {resource.note}
            </p>
          )}
        </div>

        <Dropdown>
          <DropdownTrigger>
            <Button variant="light" size="sm" isIconOnly className="shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="资源操作"
            disabledKeys={
              user.uid !== resource.userId && user.role < 3
                ? ['edit', 'delete']
                : []
            }
          >
            <DropdownItem
              key="edit"
              startContent={<Edit className="size-4" />}
              onPress={() => onEdit(resource)}
            >
              编辑
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash2 className="size-4" />}
              onPress={() => onDelete(resource.id)}
            >
              删除
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            size="sm"
            color="secondary"
            variant="flat"
            startContent={storageIcons[resource.storage]}
          >
            {SUPPORTED_RESOURCE_LINK_MAP[resource.storage as 'alist' | 'user']}
          </Chip>
          {resource.size && (
            <Chip
              size="sm"
              variant="flat"
              startContent={<Database className="size-3" />}
            >
              {resource.size}
            </Chip>
          )}
        </div>

        <Button
          color="primary"
          size="sm"
          isIconOnly
          variant={showLinks ? 'solid' : 'flat'}
          aria-label="下载资源"
          onPress={() => onDownload(resource)}
        >
          <Download className="size-4" />
        </Button>
      </div>

      {showLinks && (
        <div className="space-y-1 pt-2 border-t border-default-200">
          <p className="text-xs text-default-500">点击下面的链接以下载</p>
          {resource.content.split(',').map((link, index) => (
            <ExternalLink
              key={index}
              underline="hover"
              link={link}
              className="text-xs break-all w-full"
            >
              <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                {link}
              </span>
            </ExternalLink>
          ))}
        </div>
      )}
    </div>
  )
}
