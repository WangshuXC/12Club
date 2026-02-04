'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Button
} from '@heroui/react'
import { Search, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RenderCell } from './RenderCell'
import { FetchGet, FetchPost } from '@/utils/fetch'
import { Loading } from '@/components/common/Loading'
import { useMounted } from '@/hooks/useMounted'
import { useDebounce } from 'use-debounce'
import { SelfPagination } from '@/components/common/Pagination'
import type { AutoUpdateResource } from '@/app/api/admin/auto-update/get'
import { AddResourceModal } from './AddResourceModal'
import toast from 'react-hot-toast'

const columns = [
  { name: '封面', uid: 'banner' },
  { name: '标题', uid: 'name' },
  { name: '状态', uid: 'status' },
  { name: '集数', uid: 'accordionTotal' },
  { name: '上次更新', uid: 'lastUpdateTime' },
  { name: '操作', uid: 'actions' }
]

const PAGE_SIZE = 30

interface Props {
  initialResources: AutoUpdateResource[]
  initialTotal: number
  initialQuery?: string
}

export const AutoUpdateContainer = ({
  initialResources,
  initialTotal,
  initialQuery = ''
}: Props) => {
  const [resources, setResources] =
    useState<AutoUpdateResource[]>(initialResources)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const [loading, setLoading] = useState(false)
  const [batchUpdating, setBatchUpdating] = useState(false)
  const isMounted = useMounted()

  const fetchData = async () => {
    setLoading(true)

    const { resources, total } = await FetchGet<{
      resources: AutoUpdateResource[]
      total: number
    }>('/admin/auto-update', {
      page,
      limit: PAGE_SIZE,
      search: debouncedQuery
    })

    setLoading(false)
    setResources(resources)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }
    fetchData()
  }, [page, debouncedQuery])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  // 删除资源的回调函数
  const handleDeleteResource = (id: number) => {
    setResources((prevResources) =>
      prevResources.filter((resource) => resource.id !== id)
    )
    setTotal((prevTotal) => prevTotal - 1)
  }

  // 批量更新所有资源
  const handleBatchUpdate = async () => {
    if (batchUpdating) return

    try {
      setBatchUpdating(true)
      toast.loading('正在批量更新资源...', { id: 'batch-update' })

      const response = await FetchPost<{
        success: boolean
        message: string
        data: {
          total: number
          success: number
          failed: number
          details: Array<{
            resourceId: number
            resourceName: string
            dbId: string
            success: boolean
            message: string
          }>
        }
      }>('/admin/auto-update/batch-update', {})

      if (response.success) {
        toast.success(response.message, { id: 'batch-update' })
        // 刷新列表
        await fetchData()
      } else {
        toast.error('批量更新失败', { id: 'batch-update' })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '批量更新失败', {
        id: 'batch-update'
      })
    } finally {
      setBatchUpdating(false)
    }
  }

  // 添加资源成功的回调
  const handleResourceAdded = () => {
    fetchData()
  }

  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <div className="flex flex-col gap-2 items-start justify-between">
        <h1 className="text-2xl font-bold">一键更新管理</h1>
        <p className="text-sm text-default-500">
          可批量更新所有资源的在线播放链接
        </p>
      </div>
      <div className="flex justify-between items-center gap-4">
        <Input
          isClearable
          placeholder="搜索资源名称或ID..."
          startContent={<Search className="w-4 h-4" />}
          value={searchQuery}
          onValueChange={handleSearch}
          onClear={() => handleSearch('')}
          className="max-w-xs"
        />

        <div className="flex gap-2">
          <Button
            color="primary"
            startContent={<Play className="w-4 h-4" />}
            onPress={handleBatchUpdate}
            isLoading={batchUpdating}
            isDisabled={resources.length === 0}
          >
            批量更新播放链接
          </Button>
          <AddResourceModal onSuccess={handleResourceAdded} />
        </div>
      </div>

      <Table
        aria-label="自动更新资源管理"
        isHeaderSticky
        classNames={{
          base: 'max-h-[calc(100vh-365px)]'
        }}
        bottomContent={
          <div className="flex justify-center w-full">
            {Math.ceil(total / PAGE_SIZE) > 1 && (
              <SelfPagination
                page={page}
                total={Math.ceil(total / PAGE_SIZE)}
                onPageChange={(newPage) => setPage(newPage)}
                isLoading={loading}
              />
            )}
          </div>
        }
        bottomContentPlacement="outside"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={resources}
          emptyContent="暂无自动更新资源"
          isLoading={loading}
          loadingContent={<Loading hint="正在获取资源数据..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {RenderCell(item, columnKey.toString(), handleDeleteResource)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
