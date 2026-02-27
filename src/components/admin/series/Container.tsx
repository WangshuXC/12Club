'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

import { Input, Button, type SortDescriptor } from '@heroui/react'
import { Search, Plus } from 'lucide-react'

import { FetchGet } from '@/utils/fetch'

import { CreateSeriesModal } from './CreateSeriesModal'
import { DeleteSeriesConfirm } from './DeleteSeriesConfirm'
import { EditSeriesModal } from './EditSeriesModal'
import { SeriesTable } from './SeriesTable'

import type { AdminSeries } from '@/types/api/admin'

interface SeriesProps {
  initialSeries: AdminSeries[]
  initialTotal: number
  initialQuery: string
  initialPage: number
  initialLimit: number
  initialSortField: string
  initialSortOrder: string
}

export const Series = ({
  initialSeries,
  initialTotal,
  initialQuery,
  initialPage,
  initialLimit,
  initialSortField,
  initialSortOrder
}: SeriesProps) => {
  const [series, setSeries] = useState<AdminSeries[]>(initialSeries)
  const [total, setTotal] = useState(initialTotal)
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: initialSortField,
    direction: initialSortOrder === 'asc' ? 'ascending' : 'descending'
  })
  const [loading, setLoading] = useState(false)

  // 弹窗状态
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<AdminSeries | null>(null)

  // 使用 ref 来追踪是否已初始化
  const isInitialized = useRef(false)

  // 获取系列列表
  const fetchSeries = useCallback(async () => {
    setLoading(true)
    const sortField = sortDescriptor.column as string
    const sortOrder = sortDescriptor.direction === 'ascending' ? 'asc' : 'desc'

    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortField,
        sortOrder
      }
      if (query) {
        params.search = query
      }

      const data = await FetchGet<any>('/admin/series', params)

      if (typeof data === 'string') {
        console.error('获取系列列表失败:', data)
        return
      }

      setSeries(data.series)
      setTotal(data.total)
    } catch (error) {
      console.error('获取系列列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, limit, query, sortDescriptor])

  // 监听分页、搜索、排序变化，自动获取数据
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true

      // 初始数据已从服务端传入，不需要再次获取
      return
    }

    fetchSeries()
  }, [fetchSeries])

  // 搜索处理
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    setPage(1)

    // 更新URL
    const params = new URLSearchParams(window.location.search)
    if (searchQuery) {
      params.set('query', searchQuery)
    } else {
      params.delete('query')
    }

    params.set('page', '1')
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
  }, [])

  // 分页处理
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)

    // 更新URL
    const params = new URLSearchParams(window.location.search)
    params.set('page', newPage.toString())
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
  }, [])

  // 排序处理
  const handleSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
    setPage(1)

    // 更新URL
    const sortField = descriptor.column as string
    const sortOrder = descriptor.direction === 'ascending' ? 'asc' : 'desc'
    const params = new URLSearchParams(window.location.search)
    params.set('sortField', sortField)
    params.set('sortOrder', sortOrder)
    params.set('page', '1')
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
  }, [])

  // 编辑系列
  const handleEdit = useCallback((seriesItem: AdminSeries) => {
    setSelectedSeries(seriesItem)
    setEditModalOpen(true)
  }, [])

  // 删除系列
  const handleDelete = useCallback((seriesItem: AdminSeries) => {
    setSelectedSeries(seriesItem)
    setDeleteConfirmOpen(true)
  }, [])

  // 刷新列表
  const handleRefresh = useCallback(() => {
    fetchSeries()
  }, [fetchSeries])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">系列管理</h1>
          <p className="text-default-500 mt-1">管理资源系列，组织相关内容</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => setCreateModalOpen(true)}
        >
          创建系列
        </Button>
      </div>

      {/* 搜索 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="搜索系列名称或描述..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query)
              }
            }}
            startContent={<Search size={16} />}
            className="max-w-md"
          />
        </div>
      </div>

      {/* 系列表格 */}
      <SeriesTable
        series={series}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        sortDescriptor={sortDescriptor}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      {/* 创建系列弹窗 */}
      <CreateSeriesModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* 编辑系列弹窗 */}
      {selectedSeries && (
        <EditSeriesModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedSeries(null)
          }}
          series={selectedSeries}
          onSuccess={handleRefresh}
        />
      )}

      {/* 删除确认弹窗 */}
      {selectedSeries && (
        <DeleteSeriesConfirm
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false)
            setSelectedSeries(null)
          }}
          series={selectedSeries}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  )
}
