'use client'

import { useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Input,
  Pagination,
  SortDescriptor
} from '@heroui/react'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { Loading } from '@/components/common/Loading'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { RenderCell } from './RenderCell'

import type { AdminUser } from '@/types/api/admin'

const columns = [
  { name: '用户', uid: 'user', allowsSorting: false },
  { name: '资源数', uid: 'resource', allowsSorting: true },
  { name: '下载资源数', uid: 'resource_patch', allowsSorting: true },
  { name: '角色', uid: 'role', allowsSorting: false },
  { name: '状态', uid: 'status', allowsSorting: false },
  { name: '创建时间', uid: 'created', allowsSorting: true },
  { name: '操作', uid: 'actions', allowsSorting: false }
]

interface Props {
  initialUsers: AdminUser[]
  initialTotal: number
}

const PAGE_SIZE = 30

export const User = ({ initialUsers, initialTotal }: Props) => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'created',
    direction: 'descending'
  })
  const isMounted = useMounted()

  const [loading, setLoading] = useState(false)
  const fetchData = async () => {
    setLoading(true)

    // 转换排序描述符为API参数
    const sortField = sortDescriptor.column as
      | 'resource'
      | 'resource_patch'
      | 'created'
    const sortOrder = sortDescriptor.direction === 'ascending' ? 'asc' : 'desc'

    const { users, total } = await FetchGet<{
      users: AdminUser[]
      total: number
    }>('/admin/user', {
      page,
      limit: PAGE_SIZE,
      search: debouncedQuery,
      sortField,
      sortOrder
    })

    setLoading(false)
    setUsers(users)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page, debouncedQuery, sortDescriptor])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor)
    setPage(1)
  }

  // 更新用户的回调函数
  const handleUpdateUser = (
    userId: number,
    updatedUser: Partial<AdminUser>
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updatedUser } : user
      )
    )
  }

  // 删除用户的回调函数
  const handleDeleteUser = (userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    setTotal((prevTotal) => prevTotal - 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
      </div>

      <Input
        fullWidth
        isClearable
        placeholder="搜索用户名或邮箱..."
        startContent={<Search className="text-default-300" size={20} />}
        value={searchQuery}
        onValueChange={handleSearch}
      />

      <Table
        aria-label="用户管理"
        isHeaderSticky
        classNames={{
          base: 'h-[calc(100vh-365px)]'
        }}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
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
            <TableColumn key={column.uid} allowsSorting={column.allowsSorting}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={users}
          isLoading={loading}
          loadingContent={<Loading hint="正在获取消息数据..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {RenderCell(
                    item,
                    columnKey.toString(),
                    handleUpdateUser,
                    handleDeleteUser
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
