'use client'

import { useState } from 'react'

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Trash2 } from 'lucide-react'

import { ErrorHandler } from '@/utils/errorHandler'
import { FetchDelete } from '@/utils/fetch'

import type { AdminAnnouncement } from '@/types/api/admin'

interface Props {
  announcement: AdminAnnouncement
  onDelete?: (announcementId: number) => void
}

export const AnnouncementDelete = ({ announcement, onDelete }: Props) => {
  const [deleting, setDeleting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleDeleteAnnouncement = async () => {
    setDeleting(true)
    const res = await FetchDelete('/admin/announcement', {
      id: announcement.id
    })
    setDeleting(false)

    ErrorHandler(res, () => {
      addToast({
        title: '成功',
        description: `删除公告 "${announcement.title}" 成功`,
        color: 'success'
      })

      if (onDelete) {
        onDelete(announcement.id)
      }

      onClose()
    })
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        color="danger"
        variant="light"
        onPress={onOpen}
        aria-label="删除公告"
      >
        <Trash2 size={16} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除公告 <strong>&quot;{announcement.title}&quot;</strong>{' '}
              吗？
            </p>
            <p className="text-sm text-gray-500 mt-2">
              此操作不可撤销，请谨慎操作。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteAnnouncement}
              isLoading={deleting}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
