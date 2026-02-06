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
  Textarea
} from '@heroui/react'

import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'

import type { AdminAnnouncement } from '@/types/api/admin'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: (announcement: AdminAnnouncement) => void
}

export const AnnouncementCreate = ({ isOpen, onClose, onSuccess }: Props) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      addToast({
        title: '错误',
        description: '请填写完整的公告信息',
        color: 'danger'
      })
      return
    }

    const requestData = {
      title: title.trim(),
      content: content.trim()
    }

    setCreating(true)
    const res = await FetchPost<{ data: AdminAnnouncement }>('/admin/announcement', requestData)
    setCreating(false)

    ErrorHandler(res, (data) => {
      addToast({
        title: '成功',
        description: '创建公告成功',
        color: 'success'
      })

      onSuccess(data.data)
      handleModalClose()
    })
  }

  const handleModalClose = () => {
    setTitle('')
    setContent('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} size="2xl">
      <ModalContent>
        <ModalHeader>创建公告</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="公告标题"
              placeholder="请输入公告标题"
              value={title}
              onValueChange={setTitle}
              isRequired
            />
            <Textarea
              label="公告内容"
              placeholder="请输入公告内容"
              value={content}
              onValueChange={setContent}
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
            onPress={handleCreateAnnouncement}
            isLoading={creating}
          >
                        创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 