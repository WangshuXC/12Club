'use client'

import { useState } from 'react'

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Avatar,
  Button,
  SortDescriptor
} from '@heroui/react'

import { SelfPagination } from '@/components/common/Pagination'
import { SelfUser } from '@/components/common/user-card/User'
import { parseUserAgentLabel } from '@/utils/device'
import type { TrackingQueryRange } from '@/store/adminTrackingStore'

import { VisitorDetailModal } from './VisitorDetailModal'

import type {
  VisitorStats,
  PaginationInfo
} from '@/app/admin/tracking/visitors/actions'

interface VisitorStatsTableProps {
  data: VisitorStats[]
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  sortDescriptor: SortDescriptor
  onSortChange: (descriptor: SortDescriptor) => void
  loading: boolean
  range: TrackingQueryRange
}

// 访客列表表格
export const VisitorStatsTable = ({
  data,
  pagination,
  onPageChange,
  sortDescriptor,
  onSortChange,
  loading,
  range
}: VisitorStatsTableProps) => {
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorStats | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const handleRowClick = (item: VisitorStats) => {
    setSelectedVisitor(item)
    setIsModalOpen(true)
  }

  const columns = [
    { name: '用户/访客', uid: 'user', allowsSorting: true },
    { name: '设备', uid: 'device', allowsSorting: false },
    { name: 'IP地址', uid: 'ip', allowsSorting: false },
    { name: '本期首次活跃', uid: 'first_active', allowsSorting: true },
    { name: '本期最后活跃', uid: 'last_active', allowsSorting: true },
    { name: '事件数', uid: 'events_count', allowsSorting: true },
    { name: '操作', uid: 'actions', allowsSorting: false }
  ]

  const renderDevices = (item: VisitorStats) => {
    const devices = Array.from(
      new Set(
        item.user_agents.map((userAgent) => parseUserAgentLabel(userAgent))
      )
    )

    return (
      <div className="flex max-w-48 flex-wrap gap-1" title={devices.join('、')}>
        {devices.map((device) => (
          <Chip key={device} size="sm" variant="flat">
            {device}
          </Chip>
        ))}
      </div>
    )
  }

  const renderIps = (item: VisitorStats) => {
    if (item.ips.length === 0) return '-'

    return (
      <span className="text-xs font-mono" title={item.ips.join('\n')}>
        {item.ips[0]}
        {item.ips.length > 1 ? ` 等 ${item.ips.length} 个` : ''}
      </span>
    )
  }

  // 渲染用户/访客信息
  const renderUserCell = (item: VisitorStats) => {
    if (item.user) {
      return (
        <SelfUser
          user={item.user}
          userProps={{
            name: item.user.name,
            description: item.user.email,
            avatarProps: {
              src: item.user.avatar,
              showFallback: true,
              name: item.user.name.charAt(0).toUpperCase()
            }
          }}
        />
      )
    }

    return (
      <div className="flex items-center gap-3">
        <Avatar
          showFallback
          name="?"
          size="sm"
          classNames={{
            base: 'bg-default-200'
          }}
        />
        <div className="flex flex-col">
          <span className="text-sm text-default-400">游客</span>
          <span
            className="text-xs font-mono text-default-300 truncate max-w-[120px]"
            title={item.guid}
          >
            {item.guid.slice(0, 8)}…
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Table
        aria-label="访客列表"
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.allowsSorting}
              align={
                column.uid === 'events_count' || column.uid === 'actions'
                  ? 'center'
                  : 'start'
              }
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent="暂无数据"
          isLoading={loading}
          loadingContent={<Spinner />}
        >
          {data.map((item) => (
            <TableRow key={item.user_id ? `user-${item.user_id}` : item.id}>
              <TableCell>{renderUserCell(item)}</TableCell>
              <TableCell>{renderDevices(item)}</TableCell>
              <TableCell>{renderIps(item)}</TableCell>
              <TableCell>
                <span className="text-xs">{formatDate(item.first_active)}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{formatDate(item.last_active)}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {item.events_count.toLocaleString()}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => handleRowClick(item)}
                  >
                    查看轨迹
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <SelfPagination
            total={pagination.totalPages}
            page={pagination.page}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <VisitorDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        visitor={selectedVisitor}
        range={range}
      />
    </div>
  )
}
