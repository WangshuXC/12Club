'use client'

import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@heroui/react'
import { Edit2, ExternalLink } from 'lucide-react'

import { safeDecodeURI } from '@/utils/link'

import { ResourcePlayLinkDelete } from './ResourcePlayLinkDelete'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

interface Props {
  playLinks: ResourcePlayLink[]
  loading: boolean
  onEdit: (playLink: ResourcePlayLink) => void
  onDelete: (id: number) => Promise<void>
}

export const PlayLinkTable = ({
  playLinks,
  loading,
  onEdit,
  onDelete
}: Props) => {
  if (!playLinks?.length) {
    return <div className="text-center py-8 text-default-500">暂无在线资源</div>
  }

  return (
    <Table aria-label="播放链接列表">
      <TableHeader>
        <TableColumn>集数序号</TableColumn>
        <TableColumn>显示名称</TableColumn>
        <TableColumn>播放链接</TableColumn>
        <TableColumn>添加者</TableColumn>
        <TableColumn>添加时间</TableColumn>
        <TableColumn>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {playLinks.map((playLink) => (
          <TableRow key={playLink.id}>
            <TableCell>
              <Chip color="primary" variant="flat">
                {playLink.accordion}
              </Chip>
            </TableCell>
            <TableCell>
              <Chip color="primary" variant="flat">
                {playLink.show_accordion
                  ? playLink.show_accordion
                  : playLink.accordion}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span className="break-all">
                  {safeDecodeURI(playLink.link)}
                </span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => window.open(playLink.link, '_blank')}
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
            </TableCell>
            <TableCell>{playLink.user?.name || '未知用户'}</TableCell>
            <TableCell>
              {new Date(playLink.created).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={() => onEdit(playLink)}
                  isDisabled={loading}
                >
                  <Edit2 size={14} />
                </Button>
                <ResourcePlayLinkDelete
                  resource={playLink}
                  onDelete={onDelete}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
