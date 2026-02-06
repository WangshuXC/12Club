'use client'

import { useState, useMemo } from 'react'

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Accordion,
  AccordionItem,
  Image,
  Badge,
  SortDescriptor,
  Button,
  Tooltip
} from '@heroui/react'
import { Users } from 'lucide-react'
import Link from 'next/link'

import { SelfPagination } from '@/components/common/Pagination'
import { TYPE_CHINESE_MAP } from '@/constants/resource'
import { cn } from '@/lib/utils'
import { getRouteByDbId, getResourceTypeByDbId } from '@/utils/router'

import { VisitorsModal } from './VisitorsModal'

import type { AnimeStats, PaginationInfo } from '@/app/admin/tracking/actions'

interface AnimeStatsTableProps {
  data: AnimeStats[]
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
  loading: boolean
  startDate?: string
  endDate?: string
}

const columns = [
  { name: '封面', uid: 'banner', allowsSorting: false },
  { name: '名称', uid: 'name', allowsSorting: true },
  { name: '播放次数', uid: 'playCount', allowsSorting: true },
  { name: '独立访客', uid: 'uniqueVisitors', allowsSorting: true },
  { name: '分集详情', uid: 'episodes', allowsSorting: true }
]

// 动漫播放统计表格
export const AnimeStatsTable = ({
  data,
  pagination,
  onPageChange,
  loading,
  startDate,
  endDate
}: AnimeStatsTableProps) => {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'playCount',
    direction: 'descending'
  })
  const [selectedAnime, setSelectedAnime] = useState<{
    dbid: string
    name: string
  } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 排序后的数据
  const sortedData = useMemo(() => {
    if (!sortDescriptor.column) {
      return data
    }

    return [...data].sort((a, b) => {
      let comparison = 0

      switch (sortDescriptor.column) {
      case 'name':
        comparison = a.name.localeCompare(b.name, 'zh-CN')
        break
      case 'playCount':
        comparison = a.playCount - b.playCount
        break
      case 'uniqueVisitors':
        comparison = a.uniqueVisitors - b.uniqueVisitors
        break
      case 'episodes':
        comparison = a.accordionStats.length - b.accordionStats.length
        break
      }

      return sortDescriptor.direction === 'ascending' ? comparison : -comparison
    })
  }, [data, sortDescriptor])

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
  }

  const handleViewVisitors = (dbid: string, name: string) => {
    setSelectedAnime({ dbid, name })
    setModalOpen(true)
  }

  return (
    <div>
      <Table
        aria-label="动漫播放统计"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.allowsSorting}
              align={column.uid === 'playCount' || column.uid === 'uniqueVisitors' ? 'center' : 'start'}
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
          {sortedData.map((item) => (
            <TableRow key={item.dbid}>
              <TableCell>
                <div>
                  <Badge
                    color="primary"
                    variant="solid"
                    showOutline={false}
                    isInvisible={
                      !(item.dbid.startsWith('a') && item.status === 1)
                    }
                    content="完结"
                  >
                    <Image
                      alt={item.name}
                      className="object-cover rounded-none min-w-24"
                      width={90}
                      src={item.banner}
                      style={{ aspectRatio: '3/4' }}
                    />
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={getRouteByDbId(item.dbid)}
                  className="font-medium hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="truncate max-w-[200px]">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.dbid}</p>
                  <p
                    className={cn(
                      'text-xs text-gray-400',
                      getResourceTypeByDbId(item.dbid) === 'anime' &&
                        'text-primary'
                    )}
                  >
                    {
                      TYPE_CHINESE_MAP[
                        getResourceTypeByDbId(
                          item.dbid
                        ) as keyof typeof TYPE_CHINESE_MAP
                      ]
                    }
                  </p>
                </Link>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {item.playCount.toLocaleString()}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Chip size="sm" variant="flat" color="success">
                    {item.uniqueVisitors.toLocaleString()}
                  </Chip>
                  <Tooltip content="查看访客详情">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleViewVisitors(item.dbid, item.name)}
                    >
                      <Users size={16} />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell>
                {item.accordionStats.length > 0 && (
                  <Accordion isCompact>
                    <AccordionItem
                      key="episodes"
                      title={`${item.accordionStats.length} 集数据`}
                      classNames={{
                        title: 'text-sm',
                        content: 'text-xs'
                      }}
                    >
                      <div className="space-y-1">
                        {item.accordionStats.map((ep) => (
                          <div
                            key={ep.accordion}
                            className="flex justify-between"
                          >
                            <span>第 {ep.accordion} 集</span>
                            <span>播放: {ep.playCount}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  </Accordion>
                )}
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
      {selectedAnime && (
        <VisitorsModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedAnime(null)
          }}
          type="anime"
          dbid={selectedAnime.dbid}
          animeName={selectedAnime.name}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  )
}
