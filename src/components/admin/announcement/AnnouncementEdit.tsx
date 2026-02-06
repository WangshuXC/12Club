'use client'

import { useState } from 'react'

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure
} from '@heroui/react'
import { Edit2 } from 'lucide-react'

import { SelfUser } from '@/components/common/user-card/User'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPut } from '@/utils/fetch'

import type { AdminAnnouncement } from '@/types/api/admin'

interface Props {
  initialAnnouncement: AdminAnnouncement
  onUpdate?: (
    announcementId: number,
    updatedAnnouncement: Partial<AdminAnnouncement>
  ) => void
}

export const AnnouncementEdit = ({ initialAnnouncement, onUpdate }: Props) => {
  const [announcement, setAnnouncement] =
    useState<AdminAnnouncement>(initialAnnouncement)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleChange = (key: keyof AdminAnnouncement, value: string) => {
    setAnnouncement((prev) => ({ ...prev, [key]: value }))
  }

  const [updating, setUpdating] = useState(false)
  const handleUpdateAnnouncement = async () => {
    const requestData = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content
    }

    setUpdating(true)
    const res = await FetchPut<object>('/admin/announcement', requestData)
    setUpdating(false)

    ErrorHandler(res, () => {
      addToast({
        title: '成功',
        description: '更新公告成功',
        color: 'success'
      })

      // 调用父组件的更新回调函数
      if (onUpdate) {
        onUpdate(announcement.id, {
          title: announcement.title,
          content: announcement.content,
          updated: new Date()
        })
      }

      onClose()
    })
  }

  const handleModalClose = () => {
    setAnnouncement(initialAnnouncement)
    onClose()
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={onOpen}
        aria-label="编辑公告"
      >
        <Edit2 size={16} />
      </Button>

      <Modal isOpen={isOpen} onClose={handleModalClose} size="2xl">
        <ModalContent>
          <ModalHeader>编辑公告</ModalHeader>
          <ModalBody>
            <SelfUser
              user={announcement.user}
              userProps={{
                name: announcement.user.name,
                avatarProps: {
                  src: announcement.user.avatar
                }
              }}
            />
            <div className="space-y-4">
              <Input
                label="公告标题"
                placeholder="请输入公告标题"
                value={announcement.title}
                onValueChange={(value) => handleChange('title', value)}
                isRequired
              />
              <Textarea
                label="公告内容"
                placeholder="请输入公告内容"
                value={announcement.content}
                onValueChange={(value) => handleChange('content', value)}
                minRows={6}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleModalClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateAnnouncement}
              isLoading={updating}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
