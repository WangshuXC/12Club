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

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchDelete } from '@/utils/fetch'

import type { AdminResource } from '@/types/api/admin'

interface Props {
  resource: AdminResource
  onDelete?: (resourceId: number) => void
}

export const ResourceDelete = ({ resource, onDelete }: Props) => {
  const currentUser = useUserStore((state) => state.user)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [deleting, setDeleting] = useState(false)

  const handleDeleteResource = async () => {
    setDeleting(true)
    const res = await FetchDelete<object>('/admin/resource', {
      id: resource.id
    })
    setDeleting(false)

    ErrorHandler(res, () => {
      addToast({
        title: '成功',
        description: '删除资源成功',
        color: 'success'
      })

      if (onDelete) {
        onDelete(resource.id)
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
        isDisabled={currentUser.role < 3}
      >
        <Trash2 size={16} />
      </Button>

      <Modal size="2xl" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>删除资源: {resource.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-danger">
                  ⚠️ 危险操作
                </h2>
                <p className="text-danger-700">
                  您确定要删除资源 <strong>{resource.name}</strong> 吗？
                </p>
              </div>

              <div className="bg-default-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">此操作将会：</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-default-600">
                  <li>永久删除资源的所有信息</li>
                  <li>删除所有相关的下载包</li>
                  <li>删除所有相关的评论</li>
                  <li>删除所有相关的收藏记录</li>
                  <li>
                    此操作<strong>不可撤销</strong>
                  </li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              isDisabled={deleting}
              isLoading={deleting}
              onPress={handleDeleteResource}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
