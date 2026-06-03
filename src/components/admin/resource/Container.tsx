'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Input
} from '@heroui/react'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { GetActions } from '@/app/admin/resource/actions'
import { Loading } from '@/components/common/Loading'
import { useAdminResourceStore } from '@/store/adminResourceStore'

import { AdminResourceOption } from './AdminResourceOption'
import { AdminResourceSort } from './AdminResourceSort'
import { RenderCell } from './RenderCell'

import type { SortField, SortOrder } from '@/components/pageContainer/sort'
import type { AdminResource } from '@/types/api/admin'

const RESOURCE_TYPES = ['a', 'c', 'g', 'n'] as const

type ResourceType = (typeof RESOURCE_TYPES)[number]

const columns = [
  { name: '封面', uid: 'banner' },
  { name: '标题', uid: 'name' },
  { name: '状态', uid: 'status' },
  { name: '更新时间', uid: 'updated' },
  { name: '创建时间', uid: 'created' },
  { name: '操作', uid: 'actions' }
]

const PAGE_SIZE = 30

interface Props {
  initialResources: AdminResource[]
  initialTotal: number
  initialQuery?: string
  initialPage?: number
  initialTypes?: ResourceType[]
  initialSortField?: SortField
  initialSortOrder?: SortOrder
}

export const Resource = ({
  initialResources,
  initialTotal,
  initialQuery = '',
  initialPage = 1,
  initialTypes = [...RESOURCE_TYPES],
  initialSortField = 'updated',
  initialSortOrder = 'desc'
}: Props) => {
  const [resources, setResources] = useState<AdminResource[]>(initialResources)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(initialPage)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const [isPending, startTransition] = useTransition()
  const adminResourceData = useAdminResourceStore((state) => state.data)
  const setAdminResourceData = useAdminResourceStore((state) => state.setData)
  const isInitialMount = useRef(true)

  // 根据store状态构建类型过滤数组
  const getFilterTypes = () => {
    const types: ResourceType[] = []
    if (adminResourceData.searchInAnime) types.push('a')
    if (adminResourceData.searchInComic) types.push('c')
    if (adminResourceData.searchInGame) types.push('g')
    if (adminResourceData.searchInNovel) types.push('n')

    return types.length > 0 && types.length < RESOURCE_TYPES.length
      ? types
      : undefined
  }

  const updateUrl = (filterTypes: ResourceType[] | undefined) => {
    const params = new URLSearchParams(window.location.search)

    if (debouncedQuery) {
      params.set('query', debouncedQuery)
    } else {
      params.delete('query')
    }

    params.set('page', page.toString())
    params.set('sortField', adminResourceData.sortField)
    params.set('sortOrder', adminResourceData.sortOrder)

    if (filterTypes?.length) {
      params.set('types', filterTypes.join(','))
    } else {
      params.delete('types')
    }

    const queryString = params.toString()
    window.history.replaceState(
      {},
      '',
      queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
    )
  }

  useEffect(() => {
    const nextData = {
      ...adminResourceData,
      searchInAnime: initialTypes.includes('a'),
      searchInComic: initialTypes.includes('c'),
      searchInGame: initialTypes.includes('g'),
      searchInNovel: initialTypes.includes('n'),
      sortField: initialSortField,
      sortOrder: initialSortOrder
    }

    const isSameData =
      adminResourceData.searchInAnime === nextData.searchInAnime &&
      adminResourceData.searchInComic === nextData.searchInComic &&
      adminResourceData.searchInGame === nextData.searchInGame &&
      adminResourceData.searchInNovel === nextData.searchInNovel &&
      adminResourceData.sortField === nextData.sortField &&
      adminResourceData.sortOrder === nextData.sortOrder

    if (!isSameData) {
      setAdminResourceData(nextData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const filterTypes = getFilterTypes()
    updateUrl(filterTypes)

    startTransition(async () => {
      const response = await GetActions({
        page,
        limit: PAGE_SIZE,
        search: debouncedQuery,
        sortField: adminResourceData.sortField,
        sortOrder: adminResourceData.sortOrder,
        ...(filterTypes && { types: filterTypes })
      })

      if (typeof response === 'string') {
        console.error('获取资源列表失败:', response)
        return
      }

      setResources(response.resources)
      setTotal(response.total)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, adminResourceData])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  // 删除资源的回调函数
  const handleDeleteResource = (resourceId: number) => {
    setResources((prevResources) =>
      prevResources.filter((resource) => resource.id !== resourceId)
    )
    setTotal((prevTotal) => prevTotal - 1)
  }

  // 更新资源的回调函数
  const handleUpdateResource = (
    resourceId: number,
    updatedResource: Partial<AdminResource>
  ) => {
    setResources((prevResources) =>
      prevResources.map((resource) =>
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
        <AdminResourceSort onChange={() => setPage(1)} />
        <AdminResourceOption onChange={() => setPage(1)} />
      </div>

      <Table
        aria-label="资源管理"
        isHeaderSticky
        classNames={{
          base: 'max-h-[calc(100vh-365px)]'
        }}
        bottomContent={
        <div className="flex justify-center w-full">
          {Math.ceil(total / PAGE_SIZE) > 1 && (
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={Math.ceil(total / PAGE_SIZE)}
              onChange={(page) => setPage(page)}
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
          emptyContent="暂无资源数据"
          isLoading={isPending}
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
