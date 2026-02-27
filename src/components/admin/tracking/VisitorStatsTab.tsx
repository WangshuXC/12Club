'use client'

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Avatar
} from '@heroui/react'

import { SelfPagination } from '@/components/common/Pagination'
import { SelfUser } from '@/components/common/user-card/User'
import { parseUserAgentLabel } from '@/utils/device'

import type {
  VisitorStats,
  PaginationInfo
} from '@/app/admin/tracking/visitors/actions'

interface VisitorStatsTableProps {
  data: VisitorStats[]
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  loading: boolean
}

// 访客列表表格
export const VisitorStatsTable = ({
  data,
  pagination,
  onPageChange,
  loading
}: VisitorStatsTableProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  // 渲染用户/访客信息
  const renderUserCell = (item: VisitorStats) => {
    if (item.user) {
      // 已登录用户，使用 SelfUser 组件显示
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

    // 游客，显示默认头像和访客ID
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
            {item.guid.slice(0, 8)}...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Table aria-label="访客列表">
        <TableHeader>
          <TableColumn>用户/访客</TableColumn>
          <TableColumn>设备</TableColumn>
          <TableColumn>IP地址</TableColumn>
          <TableColumn>首次访问</TableColumn>
          <TableColumn>最后访问</TableColumn>
          <TableColumn align="center">事件数</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="暂无数据"
          isLoading={loading}
          loadingContent={<Spinner />}
        >
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{renderUserCell(item)}</TableCell>
              <TableCell>
                <span className="text-sm" title={item.user_agent}>
                  {parseUserAgentLabel(item.user_agent)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono">{item.ip || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{formatDate(item.first_seen)}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs">{formatDate(item.last_seen)}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {item.events_count.toLocaleString()}
                </Chip>
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
    </div>
  )
}
