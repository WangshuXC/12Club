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
  Button,
  Tooltip
} from '@heroui/react'
import { Users } from 'lucide-react'

import { SelfPagination } from '@/components/common/Pagination'

import { VisitorsModal } from './VisitorsModal'

import type { PageStats, PaginationInfo } from '@/app/admin/tracking/actions'

interface PageStatsTableProps {
  data: PageStats[]
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  loading: boolean
  startDate?: string
  endDate?: string
}

// 页面访问统计表格
export const PageStatsTable = ({
  data,
  pagination,
  onPageChange,
  loading,
  startDate,
  endDate
}: PageStatsTableProps) => {
  const [selectedPage, setSelectedPage] = useState<{
    url: string
    title: string
  } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 从 URL 中提取路径显示
  const extractPath = (url: string) => {
    try {
      const urlObj = new URL(url)

      return urlObj.pathname || url
    } catch {
      return url
    }
  }

  const handleViewVisitors = (pageUrl: string, pageTitle: string) => {
    setSelectedPage({ url: pageUrl, title: pageTitle })
    setModalOpen(true)
  }

  return (
    <div>
      <Table aria-label="页面访问统计">
        <TableHeader>
          <TableColumn>页面路径</TableColumn>
          <TableColumn>页面标题</TableColumn>
          <TableColumn align="center">总访问量</TableColumn>
          <TableColumn align="center">独立访客</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="暂无数据"
          isLoading={loading}
          loadingContent={<Spinner />}
        >
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <span
                  className="text-sm truncate max-w-[300px] block"
                  title={item.page_url}
                >
                  {extractPath(item.page_url)}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{item.page_title}</span>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {item.total_views.toLocaleString()}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Chip size="sm" variant="flat" color="success">
                    {item.unique_visitors.toLocaleString()}
                  </Chip>
                  <Tooltip content="查看访客详情">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() =>
                        handleViewVisitors(item.page_url, item.page_title)
                      }
                    >
                      <Users size={16} />
                    </Button>
                  </Tooltip>
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

      {/* 访客详情 Modal */}
      {selectedPage && (
        <VisitorsModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedPage(null)
          }}
          type="page"
          pageUrl={selectedPage.url}
          pageTitle={selectedPage.title}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  )
}
