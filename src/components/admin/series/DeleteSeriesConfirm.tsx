'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip
} from '@heroui/react'
import { AlertTriangle } from 'lucide-react'
import { FetchDelete } from '@/utils/fetch'
import type { AdminSeries } from '@/types/api/admin'

interface DeleteSeriesConfirmProps {
  isOpen: boolean
  onClose: () => void
  series: AdminSeries
  onSuccess: () => void
}

export const DeleteSeriesConfirm = ({
  isOpen,
  onClose,
  series,
  onSuccess
}: DeleteSeriesConfirmProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 删除系列
  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await FetchDelete<any>(`/admin/series/${series.id}`, {
        id: series.id
      })

      if (typeof response === 'string') {
        setError(response)
        return
      }

      if (response.success) {
        onSuccess()
        onClose()
      } else {
        setError(response.message || '删除系列失败')
      }
    } catch (error) {
      console.error('删除系列失败:', error)
      setError('删除系列时发生错误')
    } finally {
      setLoading(false)
    }
  }

  // 关闭弹窗
  const handleClose = () => {
    if (!loading) {
      setError('')
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <AlertTriangle className="text-danger" size={20} />
          <span>确认删除系列</span>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            <p className="text-default-600">
              您确定要删除以下系列吗？此操作不可撤销。
            </p>

            <Card>
              <CardBody className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{series.name}</h4>
                  {series.description && (
                    <p className="text-default-500 text-sm">{series.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Chip color="primary" size="sm" variant="flat">
                      {series.resourceCount} 个资源
                    </Chip>
                    <Chip color="default" size="sm" variant="flat">
                      创建者: {series.user.name}
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-warning-800 text-sm">
                <strong>注意：</strong>删除系列将会：
              </p>
              <ul className="text-warning-700 text-sm mt-1 ml-4 list-disc">
                <li>永久删除系列信息</li>
                <li>移除所有资源与该系列的关联关系</li>
                <li>不会删除关联的资源本身</li>
              </ul>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button
            variant="light"
            onPress={handleClose}
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
  )
}