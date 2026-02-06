'use client'

import { useState } from 'react'

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Trash2 } from 'lucide-react'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

interface Props {
  resource: ResourcePlayLink
  onDelete: (id: number) => Promise<void>
}

export const ResourcePlayLinkDelete = ({ resource, onDelete }: Props) => {
  const [loading, setLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleDelete = async () => {
    setLoading(true)

    try {
      await onDelete(resource.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        color="danger"
        onPress={onOpen}
        isDisabled={loading}
      >
        <Trash2 size={14} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认删除播放链接</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p>确定要删除以下播放链接吗？</p>
              <div className="bg-danger-50 p-4 rounded-lg">
                <p className="font-medium">
                  集数：{resource.show_accordion || `第 ${resource.accordion} 集`}
                </p>
                <p className="text-sm text-default-600 truncate" title={resource.link}>
                  链接：{resource.link}
                </p>
              </div>
              <p className="text-sm text-danger">此操作不可撤销。</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              isDisabled={loading}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={loading}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 