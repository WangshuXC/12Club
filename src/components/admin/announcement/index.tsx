'use client'

import { useEffect, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Button
} from '@heroui/react'
import { Plus } from 'lucide-react'

import { Loading } from '@/components/common/Loading'
import { SelfPagination } from '@/components/common/Pagination'
import { AnnouncementCarousel } from '@/components/homeContainer/AnnouncementCarousel'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { AnnouncementCreate } from './AnnouncementCreate'
import { RenderCell } from './RenderCell'

import type { Announcement as AdminAnnouncement } from '@/types/api/announcement'

const columns = [
  { name: '标题', uid: 'title' },
  { name: '内容', uid: 'content' },
  { name: '创建时间', uid: 'created' },
  { name: '更新时间', uid: 'updated' },
  { name: '操作', uid: 'actions' }
]

interface Props {
    initialAnnouncements: AdminAnnouncement[]
    initialTotal: number
}

export const Announcement = ({ initialAnnouncements, initialTotal }: Props) => {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(initialAnnouncements)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const isMounted = useMounted()

  const [loading, setLoading] = useState(false)
  const fetchData = async () => {
    setLoading(true)

    const { announcements, total } = await FetchGet<{
            announcements: AdminAnnouncement[]
            total: number
        }>('/admin/announcement', {
          page,
          limit: 30,
        })

    setLoading(false)
    setAnnouncements(announcements)
    setTotal(total)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchData()
  }, [page])

  // 更新公告的回调函数
  const handleUpdateAnnouncement = (announcementId: number, updatedAnnouncement: Partial<AdminAnnouncement>) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, ...updatedAnnouncement }
          : announcement
      )
    )
  }

  // 删除公告的回调函数
  const handleDeleteAnnouncement = (announcementId: number) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.filter(announcement => announcement.id !== announcementId)
    )
    setTotal(prev => prev - 1)
  }

  // 添加新公告的回调函数
  const handleAddAnnouncement = (newAnnouncement: AdminAnnouncement) => {
    setAnnouncements(prev => [newAnnouncement, ...prev])
    setTotal(prev => prev + 1)
    setShowCreateModal(false)
  }

  if (loading) {
    return <Loading hint="加载中..." />
  }

  return (
    <div className="space-y-4 px-4 overflow-hidden">
      <AnnouncementCarousel announcements={announcements} />

      <div className="flex items-center justify-between">
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => setShowCreateModal(true)}
        >
                    创建公告
        </Button>
      </div>

      <Table aria-label="公告管理表格">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align="start"
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={announcements}
          emptyContent="暂无公告数据"
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  <RenderCell
                    announcement={item}
                    columnKey={columnKey}
                    onUpdate={handleUpdateAnnouncement}
                    onDelete={handleDeleteAnnouncement}
                  />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center">
        {Math.ceil(total / 30) > 1 && <SelfPagination
          total={Math.ceil(total / 30)}
          page={page}
          onPageChange={setPage}
        />}
      </div>

      <AnnouncementCreate
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleAddAnnouncement}
      />
    </div>
  )
} 