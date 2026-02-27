'use client'

import { useState } from 'react'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea
} from '@heroui/react'

import { FetchPost } from '@/utils/fetch'

import { ResourceSelector } from './ResourceSelector'

import type { AdminSeriesResource } from '@/types/api/admin'

interface CreateSeriesModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateSeriesModal = ({
  isOpen,
  onClose,
  onSuccess
}: CreateSeriesModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedResources, setSelectedResources] = useState<
    AdminSeriesResource[]
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 重置表单
  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedResources([])
    setError('')
  }

  // 关闭弹窗
  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  // 创建系列
  const handleCreate = async () => {
    if (!name.trim()) {
      setError('请输入系列名称')
      return
    }

    if (selectedResources.length === 0) {
      setError('请至少选择一个资源')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await FetchPost<any>('/admin/series', {
        name: name.trim(),
        description: description.trim(),
        dbIds: selectedResources.map((r) => r.dbId)
      })

      if (typeof response === 'string') {
        setError(response)
        return
      }

      if (response.success) {
        onSuccess()
        handleClose()
      } else {
        setError(response.message || '创建系列失败')
      }
    } catch (error) {
      console.error('创建系列失败:', error)
      setError('创建系列时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: 'max-h-[90vh]',
        body: 'py-6'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">创建新系列</h2>
          <p className="text-sm text-default-500">
            创建一个新的资源系列，至少需要选择一个资源
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>

              <Input
                label="系列名称"
                placeholder="请输入系列名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isRequired
                errorMessage={error && !name.trim() ? '请输入系列名称' : ''}
                isInvalid={error && !name.trim() ? true : false}
              />

              <Textarea
                label="系列描述"
                placeholder="请输入系列描述（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxRows={3}
              />
            </div>

            {/* 资源选择 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">选择资源</h3>
              <p className="text-sm text-default-500">
                至少需要选择一个资源加入系列
              </p>

              <ResourceSelector
                selectedResources={selectedResources}
                onSelectionChange={setSelectedResources}
              />
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
          <Button variant="light" onPress={handleClose} isDisabled={loading}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleCreate}
            isLoading={loading}
            isDisabled={!name.trim() || selectedResources.length === 0}
          >
            创建系列
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
