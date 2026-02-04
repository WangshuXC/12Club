'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab
} from '@heroui/react'
import { SeriesResourceManager } from './SeriesResourceManager'
import { FetchPut } from '@/utils/fetch'
import type { AdminSeries } from '@/types/api/admin'

interface EditSeriesModalProps {
  isOpen: boolean
  onClose: () => void
  series: AdminSeries
  onSuccess: () => void
}

export const EditSeriesModal = ({
  isOpen,
  onClose,
  series,
  onSuccess
}: EditSeriesModalProps) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('info')

  // 初始化表单数据
  useEffect(() => {
    if (isOpen && series) {
      setName(series.name)
      setDescription(series.description)
      setError('')
      setActiveTab('info')
    }
  }, [isOpen, series])

  // 重置表单
  const resetForm = () => {
    setName('')
    setDescription('')
    setError('')
    setActiveTab('info')
  }

  // 关闭弹窗
  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  // 更新系列信息
  const handleUpdate = async () => {
    if (!name.trim()) {
      setError('请输入系列名称')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await FetchPut<any>(`/admin/series/${series.id}`, {
        id: series.id,
        name: name.trim(),
        description: description.trim()
      })

      if (typeof response === 'string') {
        setError(response)
        return
      }

      if (response.success) {
        onSuccess()
        handleClose()
      } else {
        setError(response.message || '更新系列失败')
      }
    } catch (error) {
      console.error('更新系列失败:', error)
      setError('更新系列时发生错误')
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
          <h2 className="text-xl font-bold">编辑系列</h2>
          <p className="text-sm text-default-500">编辑系列信息和管理关联资源</p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4 pt-4">
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

            {/* 错误信息 */}
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}
          </div>
          <div className="pt-4">
            <SeriesResourceManager
              seriesId={series.id}
              onResourcesChange={onSuccess}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={loading}>
            取消
          </Button>
          {activeTab === 'info' && (
            <Button
              color="primary"
              onPress={handleUpdate}
              isLoading={loading}
              isDisabled={!name.trim()}
            >
              保存更改
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
