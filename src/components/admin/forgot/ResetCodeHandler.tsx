'use client'

import { CheckCheck } from 'lucide-react'
import {
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast
} from '@heroui/react'
import type { ResetCode } from '@/types/api/admin/forgot'
import { useState } from 'react'
import { FetchPut } from '@/utils/fetch'
import { useRouter } from 'next/navigation'

interface ResetCodeDetailProps {
  resetCode: ResetCode
  onUpdate?: (resetCodeId: number) => void
}

export const ResetCodeHandler = ({ resetCode, onUpdate }: ResetCodeDetailProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [loading, setLoading] = useState(false)

  const route = useRouter()

  const handleStatusChange = async () => {
    setLoading(true)
    try {
      const res = await FetchPut<{ status: number; message: string }>('/auth/forgot',
        { id: resetCode.id }
      )
      if (res.status === 200) {
        addToast({
          title: '成功',
          description: '已处理',
          color: 'success'
        })
        onUpdate?.(resetCode.id)
        route.refresh()
        onClose()
      } else {
        addToast({
          title: '错误',
          description: res.message || '失败',
          color: 'danger'
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      addToast({
        title: '错误',
        description: '失败',
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
        color="success"
        variant="light"
        onPress={onOpen}
        isDisabled={resetCode.status === 1}
      >
        <CheckCheck className="w-4 h-4" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认处理</ModalHeader>
          <ModalBody>
            <p>是否设置为已处理？</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleStatusChange}
              isLoading={loading}
            >
              标记为已处理
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}