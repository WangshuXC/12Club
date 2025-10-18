'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input
} from '@heroui/react'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RenderCell } from './RenderCell'
import { FetchGet } from '@/utils/fetch'
import { Loading } from '@/components/common/Loading'
import { useMounted } from '@/hooks/useMounted'
import { useDebounce } from 'use-debounce'
import { SelfPagination } from '@/components/common/Pagination'
import type { AdminResource } from '@/types/api/admin'
import { AdminResourceOption } from './AdminResourceOption'
import { AdminResourceSort } from './AdminResourceSort'
import { useAdminResourceStore } from '@/store/adminResourceStore'

const columns = [
  { name: '封面', uid: 'banner' },
  { name: '标题', uid: 'name' },
  { name: '状态', uid: 'status' },
  { name: '时间', uid: 'created' },
  { name: '操作', uid: 'actions' }
]

const PAGE_SIZE = 30

interface Props {
  initialResources: AdminResource[]
  initialTotal: number
  initialQuery?: string
}

export const Resource = ({ initialResources, initialTotal, initialQuery = '' }: Props) => {
  const [resources, setResources] = useState<AdminResource[]>(initialResources)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const isMounted = useMounted()
  const adminResourceData = useAdminResourceStore((state) => state.data)

  const [loading, setLoading] = useState(false)

  // 根据store状态构建类型过滤数组
  const getFilterTypes = () => {
    const types: ('a' | 'c' | 'g' | 'n')[] = []
    if (adminResourceData.searchInAnime) types.push('a')
    if (adminResourceData.searchInComic) types.push('c')
    if (adminResourceData.searchInGame) types.push('g')
    if (adminResourceData.searchInNovel) types.push('n')
    return types.length > 0 ? types : undefined
  }
  const fetchData = async () => {
    setLoading(true)

    const filterTypes = getFilterTypes()
    const { resources, total } = await FetchGet<{
      resources: AdminResource[]
      total: number
    }>('/admin/resource', {
      page,
      limit: PAGE_SIZE,
      search: debouncedQuery,
      sortField: adminResourceData.sortField,
      sortOrder: adminResourceData.sortOrder,
      ...(filterTypes && { types: filterTypes.join(',') })
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
  }, [page, debouncedQuery, adminResourceData])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  // 删除资源的回调函数
  const handleDeleteResource = (resourceId: number) => {
    setResources(prevResources => prevResources.filter(resource => resource.id !== resourceId))
    setTotal(prevTotal => prevTotal - 1)
  }

  // 更新资源的回调函数
  const handleUpdateResource = (resourceId: number, updatedResource: Partial<AdminResource>) => {
    setResources(prevResources =>
      prevResources.map(resource =>
        resource.id === resourceId
          ? { ...resource, ...updatedResource }
          : resource
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 items-start justify-between">
        <h1 className="text-2xl font-bold">资源管理</h1>
        <p className="text-sm text-default-500">可通过按钮筛选资源类型</p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          fullWidth
          isClearable
          placeholder="输入资源名或别名或dbId搜索资源..."
          startContent={<Search className="text-default-300" size={20} />}
          value={searchQuery}
          onValueChange={handleSearch}
        />
        <AdminResourceSort />
        <AdminResourceOption />
      </div>

      <Table
        aria-label="资源管理"
        isHeaderSticky
        classNames={{
          base: 'max-h-[calc(100vh-365px)]',
        }}
        bottomContent={
          <div className="flex justify-center w-full">
            {Math.ceil(total / PAGE_SIZE) > 1 && <SelfPagination
              page={page}
              total={Math.ceil(total / PAGE_SIZE)}
              onPageChange={(newPage) => setPage(newPage)}
              isLoading={loading}
            />}
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
          emptyContent="暂无资源数据"
          isLoading={loading}
          loadingContent={<Loading hint="正在获取资源数据..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {RenderCell(
                    item,
                    columnKey.toString(),
                    handleDeleteResource,
                    handleUpdateResource
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
