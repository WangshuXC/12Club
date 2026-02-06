'use client'

import { useState } from 'react'

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { addToast } from '@heroui/react'
import { Trash2 } from 'lucide-react'

import { FetchDelete } from '@/utils/fetch'

import type { ResetCode } from '@/types/api/admin/forgot'

interface ResetCodeDeleteProps {
  resetCode: ResetCode
  onDelete?: (resetCodeId: number) => void
}

export const ResetCodeDelete = ({
  resetCode,
  onDelete
}: ResetCodeDeleteProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const res = await FetchDelete<{ status: number; message: string }>(
        '/auth/forgot',
        { id: resetCode.id }
      )
      if (res.status === 200) {
        addToast({
          title: '成功',
          description: '重置码已删除',
          color: 'success'
        })
        onDelete?.(resetCode.id)
        onClose()
      } else {
        addToast({
          title: '错误',
          description: res.message || '删除失败',
          color: 'danger'
        })
      }
    } catch (error) {
      addToast({
        title: '错误',
        description: '删除失败',
        color: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        color="danger"
        variant="light"
        onPress={onOpen}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            <p>
              确定要删除用户 <strong>{resetCode.userName}</strong> 的重置码吗？
            </p>
            <p className="text-sm text-default-500">此操作不可撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={loading}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
