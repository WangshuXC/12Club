'use client'

import { useState, useEffect, useCallback } from 'react'

import { Button, useDisclosure, addToast } from '@heroui/react'
import { Plus, ListPlus } from 'lucide-react'

import { ErrorHandler } from '@/utils/errorHandler'
import { FetchGet, FetchPost, FetchPut, FetchDelete } from '@/utils/fetch'
import { removeHttpPrefix } from '@/utils/link'

import { OpenlistFilePickerModal } from './OpenlistFilePickerModal'
import { PlayLinkEditModal } from './PlayLinkEditModal'
import { PlayLinkTable } from './PlayLinkTable'

import type { PickerMode } from './OpenlistFilePickerModal'
import type { PlayLinkFormData } from './PlayLinkEditModal'
import type { ResourcePlayLink } from '@/types/api/resource-play-link'

interface Props {
  resourceId: number
  dbId?: string
  accordionTotal: number
  needUpdate?: boolean
}

export const ResourcePlayLinkManager = ({
  resourceId,
  dbId,
  needUpdate = false
}: Props) => {
  const [playLinks, setPlayLinks] = useState<ResourcePlayLink[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PlayLinkFormData>({
    accordion: 1,
    showAccordion: '',
    link: ''
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isFileOpen,
    onOpen: onFileOpen,
    onClose: onFileClose
  } = useDisclosure()
  const [fileList, setFileList] = useState<string[]>([])
  const [fileLoading, setFileLoading] = useState(false)
  // 文件选择器模式：single=单选填入输入框；batch=按点击顺序批量添加
  const [pickerMode, setPickerMode] = useState<PickerMode>('single')
  // 批量模式下按点击顺序保存已选文件
  const [batchSelected, setBatchSelected] = useState<string[]>([])
  const [batchSubmitting, setBatchSubmitting] = useState(false)

  // 获取播放链接列表
  const fetchPlayLinks = useCallback(async () => {
    setLoading(true)
    const res = await FetchGet<{
      success: boolean
      data?: ResourcePlayLink[]
      message?: string
    }>('/admin/resource/playLink', {
      resourceId: resourceId.toString()
    })
    setLoading(false)

    ErrorHandler(res, (response) => {
      if (response?.success && Array.isArray(response.data)) {
        setPlayLinks(response.data)
      } else {
        setPlayLinks([])
      }
    })
  }, [resourceId])

  useEffect(() => {
    fetchPlayLinks()
  }, [resourceId, needUpdate, fetchPlayLinks])

  // 重置表单
  const resetForm = () => {
    setFormData({
      accordion: playLinks?.length + 1,
      showAccordion: '',
      link: ''
    })
    setEditingId(null)
  }

  // 打开添加/编辑模态框
  const handleOpenModal = (playLink?: ResourcePlayLink) => {
    if (playLink) {
      setFormData({
        accordion: playLink.accordion,
        showAccordion: playLink.show_accordion || '',
        link: playLink.link
      })
      setEditingId(playLink.id)
    } else {
      resetForm()
    }

    onOpen()
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formData.link.trim()) {
      addToast({
        title: '错误',
        description: '请输入播放链接',
        color: 'danger'
      })
      return
    }

    if (formData.accordion < 1) {
      addToast({
        title: '错误',
        description: '集数必须大于 0',
        color: 'danger'
      })
      return
    }

    setLoading(true)

    try {
      if (editingId) {
        const res = await FetchPut<{
          success: boolean
          data?: ResourcePlayLink
          message?: string
        }>('/admin/resource/playLink', {
          id: editingId,
          accordion: formData.accordion,
          showAccordion: formData.showAccordion,
          link: removeHttpPrefix(formData.link.trim())
        })

        ErrorHandler(res, (response) => {
          if (response?.success && response.data) {
            const updated = response.data
            setPlayLinks((prev) =>
              prev.map((link) => (link.id === editingId ? updated : link))
            )
            addToast({
              title: '成功',
              description: response.message || '播放链接更新成功',
              color: 'success'
            })
            onClose()
            resetForm()
          } else {
            addToast({
              title: '错误',
              description: response?.message || '播放链接更新失败',
              color: 'danger'
            })
          }
        })
      } else {
        const res = await FetchPost<{
          success: boolean
          data?: ResourcePlayLink
          message?: string
        }>('/admin/resource/playLink', {
          resourceId,
          accordion: formData.accordion,
          showAccordion: formData.showAccordion,
          link: removeHttpPrefix(formData.link.trim())
        })

        ErrorHandler(res, (response) => {
          if (response?.success && response.data) {
            const created = response.data
            setPlayLinks((prev) =>
              [...prev, created].sort((a, b) => a.accordion - b.accordion)
            )
            addToast({
              title: '成功',
              description: response.message || '播放链接添加成功',
              color: 'success'
            })
            onClose()
            resetForm()
          } else {
            addToast({
              title: '错误',
              description: response?.message || '播放链接添加失败',
              color: 'danger'
            })
          }
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // 删除播放链接
  const handleDelete = async (id: number) => {
    setLoading(true)
    const res = await FetchDelete<{ success: boolean; message?: string }>(
      '/admin/resource/playLink',
      { id }
    )
    setLoading(false)

    ErrorHandler(res, (response) => {
      if (response?.success) {
        setPlayLinks((prev) => prev.filter((link) => link.id !== id))
        addToast({
          title: '成功',
          description: response.message || '播放链接删除成功',
          color: 'success'
        })
      } else {
        addToast({
          title: '错误',
          description: response?.message || '播放链接删除失败',
          color: 'danger'
        })
      }
    })
  }

  // 打开 openlist 文件选择弹窗，拉取对应 dbId 的文件列表
  const handleOpenFilePicker = async (mode: PickerMode = 'single') => {
    if (!dbId) {
      addToast({
        title: '错误',
        description: '缺少资源 dbId，无法获取文件列表',
        color: 'danger'
      })
      return
    }

    setPickerMode(mode)
    setBatchSelected([])
    onFileOpen()
    setFileLoading(true)
    const res = await FetchGet<{
      success: boolean
      message: string
      data?: string[]
    }>('/admin/resource/autoCreate', { dbId })
    setFileLoading(false)

    ErrorHandler(res, (response) => {
      if (response?.success && Array.isArray(response.data)) {
        setFileList(response.data)
      } else {
        setFileList([])
        addToast({
          title: '错误',
          description: response?.message || '获取文件列表失败',
          color: 'danger'
        })
      }
    })
  }

  // 单选：填入输入框
  const handleSelectFile = (link: string) => {
    setFormData((prev) => ({ ...prev, link: removeHttpPrefix(link) }))
    onFileClose()
  }

  // 批量：切换选择状态，记录点击顺序
  const handleToggleBatchSelect = (link: string) => {
    setBatchSelected((prev) =>
      prev.includes(link) ? prev.filter((l) => l !== link) : [...prev, link]
    )
  }

  // 批量：按点击顺序创建播放链接，accordion 从当前最大值 +1 递增
  const handleBatchConfirm = async () => {
    if (!batchSelected.length) {
      addToast({
        title: '提示',
        description: '请至少选择一个文件',
        color: 'warning'
      })
      return
    }

    setBatchSubmitting(true)
    const startAccordion =
      (playLinks.length ? Math.max(...playLinks.map((l) => l.accordion)) : 0) +
      1

    let successCount = 0
    const errors: string[] = []
    const created: ResourcePlayLink[] = []

    for (let i = 0; i < batchSelected.length; i++) {
      const accordion = startAccordion + i
      const link = removeHttpPrefix(batchSelected[i].trim())

      try {
        const res = await FetchPost<{
          success: boolean
          data?: ResourcePlayLink
          message?: string
        }>('/admin/resource/playLink', {
          resourceId,
          accordion,
          showAccordion: '',
          link
        })

        if (typeof res === 'string') {
          errors.push(`第 ${accordion} 集: ${res}`)
        } else if (res?.success && res.data) {
          created.push(res.data)
          successCount++
        } else {
          errors.push(`第 ${accordion} 集: ${res?.message || '添加失败'}`)
        }
      } catch (err) {
        errors.push(
          `第 ${accordion} 集: ${err instanceof Error ? err.message : '添加失败'}`
        )
      }
    }

    setBatchSubmitting(false)

    if (created.length) {
      setPlayLinks((prev) =>
        [...prev, ...created].sort((a, b) => a.accordion - b.accordion)
      )
    }

    if (errors.length) {
      addToast({
        title: successCount ? '部分成功' : '错误',
        description: `成功 ${successCount} 个，失败 ${errors.length} 个：\n${errors.join('\n')}`,
        color: successCount ? 'warning' : 'danger'
      })
    } else {
      addToast({
        title: '成功',
        description: `批量添加 ${successCount} 个播放链接`,
        color: 'success'
      })
    }

    onFileClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">在线资源</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            variant="flat"
            startContent={<ListPlus size={16} />}
            onPress={() => handleOpenFilePicker('batch')}
            isDisabled={loading || !dbId}
          >
            批量添加
          </Button>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => handleOpenModal()}
            isDisabled={loading}
          >
            添加播放链接
          </Button>
        </div>
      </div>

      <PlayLinkTable
        playLinks={playLinks}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <PlayLinkEditModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={!!editingId}
        loading={loading}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        onOpenFilePicker={() => handleOpenFilePicker('single')}
        disableFilePicker={!dbId}
      />

      <OpenlistFilePickerModal
        isOpen={isFileOpen}
        onClose={onFileClose}
        mode={pickerMode}
        fileLoading={fileLoading}
        fileList={fileList}
        playLinks={playLinks}
        onSelectSingle={handleSelectFile}
        batchSelected={batchSelected}
        onToggleBatchSelect={handleToggleBatchSelect}
        batchSubmitting={batchSubmitting}
        onBatchConfirm={handleBatchConfirm}
      />
    </div>
  )
}
