'use client'

import { useState } from 'react'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Button,
  Tooltip,
  Spinner,
  Image,
  Pagination,
  type SortDescriptor
} from '@heroui/react'
import { Edit, Trash2, Eye } from 'lucide-react'
import type { AdminSeries } from '@/types/api/admin'
import { SeriesDetailModal } from './SeriesDetailModal'
import { ImagesBadge } from '@/components/ui/ImagesBadge'

interface SeriesTableProps {
  series: AdminSeries[]
  loading: boolean
  total: number
  page: number
  totalPages: number
  sortDescriptor: SortDescriptor
  onEdit: (series: AdminSeries) => void
  onDelete: (series: AdminSeries) => void
  onPageChange: (page: number) => void
  onSortChange: (descriptor: SortDescriptor) => void
}

export const SeriesTable = ({
  series,
  loading,
  total,
  page,
  totalPages,
  sortDescriptor,
  onEdit,
  onDelete,
  onPageChange,
  onSortChange
}: SeriesTableProps) => {
  const [detailSeries, setDetailSeries] = useState<AdminSeries | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const columns = [
    { name: '系列信息', uid: 'info', sortable: false },
    { name: '资源数量', uid: 'resource_count', sortable: true },
    { name: '创建时间', uid: 'created', sortable: true },
    { name: '更新时间', uid: 'updated', sortable: true },
    { name: '操作', uid: 'actions', sortable: false }
  ]

  const renderCell = (series: AdminSeries, columnKey: React.Key) => {
    switch (columnKey) {
      case 'info':
        return (
          <div
            className="flex flex-col"
            onClick={() => {
              setDetailSeries(series)
              setShowDetailModal(true)
            }}
          >
            <ImagesBadge
              text={series.name}
              images={series.resources?.map((r) => r.banner) as string[]}
              folderSize={{ width: 48, height: 36 }}
              teaserImageSize={{ width: 40, height: 28 }}
              hoverImageSize={{ width: 99, height: 133 }}
              hoverTranslateY={-150}
              hoverSpread={50}
            />
          </div>
        )
      case 'resource_count':
        return (
          <Chip
            className="capitalize"
            color={series.resourceCount > 0 ? 'success' : 'default'}
            size="sm"
            variant="flat"
          >
            {series.resourceCount} 个资源
          </Chip>
        )
      case 'created':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-xs capitalize text-default-400">
              {new Date(series.created).toLocaleDateString('zh-CN')}
            </p>
          </div>
        )
      case 'updated':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-xs capitalize text-default-400">
              {new Date(series.updated).toLocaleDateString('zh-CN')}
            </p>
          </div>
        )
      case 'actions':
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Tooltip content="编辑系列">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => onEdit(series)}
              >
                <Edit size={16} />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="删除系列">
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="light"
                onPress={() => onDelete(series)}
              >
                <Trash2 size={16} />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Table
        aria-label="系列管理表格"
        removeWrapper
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
        bottomContent={
          totalPages > 1 && (
            <div className="flex justify-center w-full">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={onPageChange}
              />
            </div>
          )
        }
        bottomContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={series}
          emptyContent="暂无系列数据"
          className="relative z-30"
          loadingContent={<Spinner />}
          isLoading={loading}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <SeriesDetailModal
        series={detailSeries}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setDetailSeries(null)
        }}
      />
    </>
  )
}
