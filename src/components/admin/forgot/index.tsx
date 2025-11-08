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
import type { ResetCode } from '@/types/api/admin/forgot'

const columns = [
    { name: '用户信息', uid: 'user' },
    { name: '重置码', uid: 'resetCode' },
    { name: '状态', uid: 'status'},
    { name: '创建时间', uid: 'createdAt' },
    { name: '操作', uid: 'actions' }
]

interface Props {
    initialResetCodes: ResetCode[]
    initialTotal: number
    initialStats: {
        total: number
    }
}

export const Forgot = ({ initialResetCodes, initialTotal, initialStats }: Props) => {
    const [resetCodes, setResetCodes] = useState<ResetCode[]>(initialResetCodes)
    const [total, setTotal] = useState(initialTotal)
    const [stats, setStats] = useState(initialStats)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery] = useDebounce(searchQuery, 500)
    const isMounted = useMounted()

    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)

        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10',
            ...(debouncedQuery && { search: debouncedQuery })
        })

        const response = await FetchGet<{
            resetCodes: ResetCode[]
            total: number
            stats: {
                total: number
            }
        }>(`/auth/forgot?${params}`)

        setLoading(false)
        setResetCodes(response.resetCodes)
        setTotal(response.total)
        setStats(response.stats)
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


    // 删除重置码的回调函数
    const handleDeleteResetCode = (resetCodeId: number) => {
        setResetCodes(prevCodes => prevCodes.filter(code => code.id !== resetCodeId))
        setTotal(prevTotal => prevTotal - 1)
        setStats(prevStats => ({
            ...prevStats,
            total: prevStats.total - 1
        }))
    }

    // 更新状态的回调函数
    const handleUpdateStatus = (resetCodeId: number) => {
      setResetCodes(prevCodes => prevCodes.map(code => code.id === resetCodeId ? {
        ...code,
        status: 1
      } : code))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">密码管理</h1>
            </div>

            {/* 搜索 */}
            {resetCodes && resetCodes.length > 0 && <div className="flex flex-col md:flex-row gap-4">
                <Input
                    fullWidth
                    isClearable
                    placeholder="搜索用户名、邮箱或重置码..."
                    startContent={<Search className="text-default-300" size={20} />}
                    value={searchQuery}
                    onValueChange={handleSearch}
                />
            </div>}

            {loading ? (
                <Loading hint="正在获取重置码数据..." />
            ) : (
                <Table
                    aria-label="重置码管理"
                    bottomContent={
                        <div className="flex justify-center w-full">
                            {Math.ceil(total / 10) > 1 && (
                                <SelfPagination
                                    page={page}
                                    total={Math.ceil(total / 10)}
                                    onPageChange={(newPage) => setPage(newPage)}
                                    isLoading={loading}
                                />
                            )}
                        </div>
                    }
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid}>{column.name}</TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={resetCodes} emptyContent="暂无用户申请重置密码">
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => (
                                    <TableCell>
                                        {RenderCell(
                                            item,
                                            columnKey.toString(),
                                            handleDeleteResetCode,
                                            handleUpdateStatus
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
