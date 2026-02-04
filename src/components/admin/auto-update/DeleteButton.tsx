'use client'

import { useState } from 'react'
import {
  Button,
  Tooltip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Trash2 } from 'lucide-react'
import { FetchDelete } from '@/utils/fetch'
import toast from 'react-hot-toast'

interface Props {
  id: number
  onDelete: (id: number) => void
}

export const DeleteButton = ({ id, onDelete }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      await FetchDelete<{ success: boolean; message: string }>(
        '/admin/auto-update',
        { id: id.toString() }
      )

      toast.success('移除成功')
      onDelete(id)
      onOpenChange()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '移除失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Tooltip content="移除自动更新">
        <Button
          isIconOnly
          color="danger"
          variant="light"
          size="sm"
          onPress={onOpen}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>确认移除</ModalHeader>
              <ModalBody>
                <p>确定要从自动更新列表中移除此资源吗？</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={isLoading}
                >
                  确认移除
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
