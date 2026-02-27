'use client'

import { useState, useEffect } from 'react'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  User,
  Chip
} from '@heroui/react'

import {
  getPageVisitors,
  type PageVisitor,
  type PaginationInfo
} from '@/app/admin/tracking/pages/actions'
import { getAnimeVisitors } from '@/app/admin/tracking/anime/actions'
import { SelfPagination } from '@/components/common/Pagination'
import { parseUserAgentLabel } from '@/utils/device'

type VisitorType = 'page' | 'anime'

interface VisitorsModalProps {
  isOpen: boolean
  onClose: () => void
  type: VisitorType

  // 页面访客需要的参数
  pageUrl?: string
  pageTitle?: string

  // 动漫访客需要的参数
  dbid?: string
  animeName?: string

  // 通用参数
  startDate?: string
  endDate?: string
}

export const VisitorsModal = ({
  isOpen,
  onClose,
  type,
  pageUrl,
  pageTitle,
  dbid,
  animeName,
  startDate,
  endDate
}: VisitorsModalProps) => {
  const [visitors, setVisitors] = useState<PageVisitor[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchVisitors = async (page = 1) => {
    setLoading(true)

    try {
      const start = startDate ? new Date(startDate).toISOString() : undefined
      const end = endDate
        ? new Date(endDate + 'T23:59:59').toISOString()
        : undefined

      let data = null
      if (type === 'page' && pageUrl) {
        data = await getPageVisitors(pageUrl, start, end, page, 10)
      } else if (type === 'anime' && dbid) {
        data = await getAnimeVisitors(dbid, start, end, page, 10)
      }

      if (data) {
        setVisitors(data.list)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch visitors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if ((type === 'page' && pageUrl) || (type === 'anime' && dbid)) {
        fetchVisitors(1)
      }
    }
  }, [isOpen, type, pageUrl, dbid, startDate, endDate])

  const handlePageChange = (page: number) => {
    fetchVisitors(page)
  }

  // 从 URL 中提取路径显示
  const extractPath = (url: string) => {
    try {
      const urlObj = new URL(url)

      return urlObj.pathname || url
    } catch {
      return url
    }
  }

  // 根据类型获取标题和副标题
  const getTitle = () => {
    if (type === 'page') {
      return '页面访客详情'
    }

    return '播放访客详情'
  }

  const getSubtitle = () => {
    if (type === 'page' && pageUrl) {
      return `${pageTitle} (${extractPath(pageUrl)})`
    }

    if (type === 'anime' && dbid) {
      return `${animeName} (${dbid})`
    }

    return ''
  }

  const getCountLabel = () => {
    return type === 'page' ? '访问次数' : '播放次数'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>{getTitle()}</span>
          <span className="text-sm font-normal text-default-500">
            {getSubtitle()}
          </span>
        </ModalHeader>
        <ModalBody className="pb-6">
          <Table aria-label="访客列表">
            <TableHeader>
              <TableColumn>访客</TableColumn>
              <TableColumn align="center">{getCountLabel()}</TableColumn>
              <TableColumn>设备</TableColumn>
              <TableColumn>初次访问</TableColumn>
              <TableColumn>最后访问</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="暂无访客数据"
              isLoading={loading}
              loadingContent={<Spinner />}
            >
              {visitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell>
                    {visitor.user ? (
                      <User
                        name={visitor.user.name}
                        description={visitor.user.email}
                        avatarProps={{
                          src: visitor.user.avatar,
                          size: 'sm'
                        }}
                      />
                    ) : (
                      <User
                        name="未登录用户"
                        description={visitor.guid.slice(0, 8) + '...'}
                        avatarProps={{
                          size: 'sm'
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {visitor.visit_count} 次
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-default-500">
                      {parseUserAgentLabel(visitor.user_agent)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-default-500">
                      {new Date(visitor.first_seen).toLocaleString('zh-CN')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-default-500">
                      {new Date(visitor.last_seen).toLocaleString('zh-CN')}
                    </span>
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
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
