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
  addToast
} from '@heroui/react'
import { SeriesResourceManager } from './SeriesResourceManager'
import { FetchPut, FetchPost, FetchDelete } from '@/utils/fetch'
import type { AdminSeries, AdminSeriesResource } from '@/types/api/admin'

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

  // 资源管理状态
  const [resources, setResources] = useState<AdminSeriesResource[]>([])
  const [originalDbIds, setOriginalDbIds] = useState<string[]>([])

  // 初始化表单数据
  useEffect(() => {
    if (isOpen && series) {
      setName(series.name)
      setDescription(series.description)
      setError('')
      // 直接使用外层传递的 series.resources
      const seriesResources = series.resources || []
      setResources(seriesResources)
      setOriginalDbIds(seriesResources.map((r) => r.dbId))
    }
  }, [isOpen, series])

  // 重置表单
  const resetForm = () => {
    setName('')
    setDescription('')
    setError('')
    setResources([])
    setOriginalDbIds([])
  }

  // 关闭弹窗
  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  // 计算资源变更
  const getResourceChanges = () => {
    const currentDbIds = resources.map((r) => r.dbId)
    const toAdd = currentDbIds.filter((id) => !originalDbIds.includes(id))
    const toRemove = originalDbIds.filter((id) => !currentDbIds.includes(id))
    return { toAdd, toRemove }
  }

  // 保存所有更改（系列信息 + 资源变更）
  const handleSave = async () => {
    if (!name.trim()) {
      setError('请输入系列名称')
      return
    }

    if (resources.length === 0) {
      setError('系列至少需要包含一个资源')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. 更新系列基本信息
      const updateResponse = await FetchPut<any>(`/admin/series/${series.id}`, {
        id: series.id,
        name: name.trim(),
        description: description.trim()
      })

      if (typeof updateResponse === 'string') {
        setError(updateResponse)
        return
      }

      if (!updateResponse.success) {
        setError(updateResponse.message || '更新系列信息失败')
        return
      }

      // 2. 处理资源变更
      const { toAdd, toRemove } = getResourceChanges()

      // 添加新资源
      if (toAdd.length > 0) {
        const addResponse = await FetchPost<any>(
          `/admin/series/${series.id}/resources`,
          {
            seriesId: series.id,
            dbIds: toAdd
          }
        )

        if (typeof addResponse === 'string') {
          setError(`更新系列成功，但添加资源失败: ${addResponse}`)
          return
        }

        if (!addResponse.success) {
          setError(
            `更新系列成功，但添加资源失败: ${addResponse.message || '未知错误'}`
          )
          return
        }
      }

      // 移除资源
      for (const dbId of toRemove) {
        const removeResponse = await FetchDelete<any>(
          `/admin/series/${series.id}/resources`,
          {
            seriesId: series.id,
            dbId
          }
        )

        if (typeof removeResponse === 'string') {
          setError(`更新系列成功，但移除资源失败: ${removeResponse}`)
          return
        }

        if (!removeResponse.success) {
          setError(
            `更新系列成功，但移除资源失败: ${removeResponse.message || '未知错误'}`
          )
          return
        }
      }

      // 全部成功
      onSuccess()
      addToast({
        title: '成功',
        description: '系列信息已更新',
        color: 'success'
      })
      handleClose()
    } catch (error) {
      setError('保存更改时发生错误')
    } finally {
      setLoading(false)
    }
  }

  // 检查是否有未保存的更改
  const hasChanges = () => {
    const nameChanged = name.trim() !== series.name
    const descChanged = description.trim() !== series.description
    const { toAdd, toRemove } = getResourceChanges()
    return nameChanged || descChanged || toAdd.length > 0 || toRemove.length > 0
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
          <p className="text-sm text-default-500">
            编辑系列信息和管理关联资源，点击保存后生效
          </p>
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
              isInvalid={!!(error && !name.trim())}
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
              resources={resources}
              onResourcesChange={setResources}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose} isDisabled={loading}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={loading}
            isDisabled={!name.trim() || resources.length === 0 || !hasChanges()}
          >
            保存更改
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
