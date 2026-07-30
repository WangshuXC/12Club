'use client'

import { useState } from 'react'

import {
  Button,
  Chip,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react'
import { FileSearch } from 'lucide-react'

import { SelfPagination } from '@/components/common/Pagination'
import { SelfUser } from '@/components/common/user-card/User'
import { parseUserAgentLabel } from '@/utils/device'

import type {
  TrackingLogItem,
  TrackingLogPaginationInfo
} from '@/app/admin/tracking/logs/actions'
import type { TrackingQueryRange } from '@/store/adminTrackingStore'

interface TrackingLogsTableProps {
  data: TrackingLogItem[]
  loading: boolean
  pagination: TrackingLogPaginationInfo | null
  range: TrackingQueryRange
  onPageChange: (page: number) => void
}

const eventTypeColor = {
  expose: 'secondary',
  click: 'primary',
  custom: 'success'
} as const

const formatDate = (value: string) =>
  new Date(value).toLocaleString('zh-CN', { hour12: false })

const getPath = (url: string) => {
  try {
    const parsed = new URL(url)

    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url || '-'
  }
}

const JsonBlock = ({ value }: { value: unknown }) => (
  <pre className="max-h-72 overflow-auto rounded-medium bg-default-100 p-3 text-xs leading-5 text-foreground whitespace-pre-wrap break-all">
    {value ? JSON.stringify(value, null, 2) : '—'}
  </pre>
)

const LogUser = ({ log }: { log: TrackingLogItem }) => {
  if (log.user) {
    return (
      <SelfUser
        user={log.user}
        userProps={{
          name: log.user.name,
          description: log.user.email,
          avatarProps: { src: log.user.avatar }
        }}
      />
    )
  }

  return (
    <div className="flex min-w-36 flex-col gap-1">
      <span className="text-sm text-default-500">匿名访客</span>
      <span className="font-mono text-xs" title={log.visitor.guid}>
        {log.visitor.guid.slice(0, 8)}… · #{log.visitor_id}
      </span>
    </div>
  )
}

export const TrackingLogsTable = ({
  data,
  loading,
  pagination,
  range,
  onPageChange
}: TrackingLogsTableProps) => {
  const [selectedLog, setSelectedLog] = useState<TrackingLogItem | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-default-500">
        <span>按发生时间倒序展示；点击详情可查看完整字段。</span>
        <span>
          查询区间：{formatDate(range.startISO)} ～ {formatDate(range.endISO)}
        </span>
      </div>

      <Table
        aria-label="埋点原始日志"
        isHeaderSticky
        classNames={{ wrapper: 'max-h-[65vh]' }}
      >
        <TableHeader>
          <TableColumn>发生时间</TableColumn>
          <TableColumn>事件</TableColumn>
          <TableColumn>用户/访客</TableColumn>
          <TableColumn>页面</TableColumn>
          <TableColumn>设备</TableColumn>
          <TableColumn align="center">详情</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="当前时间范围内暂无日志"
          isLoading={loading}
          loadingContent={<Spinner />}
        >
          {data.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <time className="whitespace-nowrap text-xs">
                  {formatDate(log.timestamp)}
                </time>
              </TableCell>
              <TableCell>
                <div className="flex min-w-40 flex-col gap-1">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      eventTypeColor[
                        log.event_type as keyof typeof eventTypeColor
                      ] || 'default'
                    }
                    className="w-fit"
                  >
                    {log.event_type}
                  </Chip>
                  <Code className="w-fit text-xs">{log.event_name}</Code>
                </div>
              </TableCell>
              <TableCell>
                <LogUser log={log} />
              </TableCell>
              <TableCell>
                <div className="max-w-72">
                  <p className="truncate text-sm" title={log.page_title}>
                    {log.page_title || '未命名页面'}
                  </p>
                  <p
                    className="truncate font-mono text-xs text-default-500"
                    title={log.page_url}
                  >
                    {getPath(log.page_url)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className="max-w-44 truncate text-xs"
                  title={log.visitor.user_agent}
                >
                  {parseUserAgentLabel(log.visitor.user_agent)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <Tooltip content="查看完整日志">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      aria-label={`查看日志 ${log.id} 详情`}
                      onPress={() => setSelectedLog(log)}
                    >
                      <FileSearch className="size-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <SelfPagination
            total={pagination.totalPages}
            page={pagination.page}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedLog && (
            <>
              <ModalHeader>日志详情 #{selectedLog.id}</ModalHeader>
              <ModalBody className="pb-6">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-default-500">发生时间：</span>
                    {formatDate(selectedLog.timestamp)}
                  </p>
                  <p>
                    <span className="text-default-500">事件：</span>
                    {selectedLog.event_type} / {selectedLog.event_name}
                  </p>
                  <p>
                    <span className="text-default-500">访客：</span>#
                    {selectedLog.visitor_id} · {selectedLog.visitor.guid}
                  </p>
                  <p>
                    <span className="text-default-500">用户：</span>
                    {selectedLog.user
                      ? `${selectedLog.user.name} (#${selectedLog.user.id})`
                      : '匿名'}
                  </p>
                  <p>
                    <span className="text-default-500">设备：</span>
                    {selectedLog.device_type} ·{' '}
                    {parseUserAgentLabel(selectedLog.visitor.user_agent)}
                  </p>
                  <p>
                    <span className="text-default-500">IP：</span>
                    {selectedLog.visitor.ip || '-'}
                  </p>
                  <p className="sm:col-span-2 break-all">
                    <span className="text-default-500">页面：</span>
                    {selectedLog.page_url || '-'}
                  </p>
                  <p className="sm:col-span-2 break-all">
                    <span className="text-default-500">来源：</span>
                    {selectedLog.referrer || '直接访问'}
                  </p>
                  <p>
                    <span className="text-default-500">视口：</span>
                    {selectedLog.viewport || '-'}
                  </p>
                  <p>
                    <span className="text-default-500">屏幕：</span>
                    {selectedLog.screen || '-'}
                  </p>
                  <p>
                    <span className="text-default-500">会话：</span>
                    {selectedLog.session_id || '-'}
                  </p>
                  <p>
                    <span className="text-default-500">元素：</span>
                    {selectedLog.element_tag || '-'}{' '}
                    {selectedLog.element_id ? `#${selectedLog.element_id}` : ''}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">extra_data</p>
                  <JsonBlock value={selectedLog.extra_data} />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
