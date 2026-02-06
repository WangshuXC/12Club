'use client'

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Chip, Code } from '@heroui/react'
import { addToast } from '@heroui/react'
import { Eye, Copy } from 'lucide-react'

import type { ResetCode } from '@/types/api/admin/forgot'

interface ResetCodeDetailProps {
    resetCode: ResetCode
}

export const ResetCodeDetail = ({ resetCode }: ResetCodeDetailProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return '已过期'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    } else {
      return `${minutes}分钟`
    }
  }

  const handleCopyResetCode = () => {
    navigator.clipboard.writeText(resetCode.resetCode)
    addToast({
      title: '成功',
      description: '重置码已复制到剪贴板',
      color: 'success'
    })
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        color="primary"
        variant="light"
        onPress={onOpen}
      >
        <Eye className="w-4 h-4" />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>重置码详情</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-default-600">用户信息</label>
                <div className="mt-1">
                  <div className="font-medium">{resetCode.userName}</div>
                  <div className="text-sm text-default-500">{resetCode.userEmail}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-default-600">重置码</label>
                <div className="mt-1 flex items-center gap-2">
                  <Code className="text-sm bg-default-100 px-3 py-2 rounded flex-1 font-mono">
                    {resetCode.resetCode}
                  </Code>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={handleCopyResetCode}
                    startContent={<Copy className="w-4 h-4" />}
                  >
                                        复制
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-default-600">创建时间</label>
                <div className="mt-1">{formatDate(resetCode.createdAt)}</div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
                            关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
