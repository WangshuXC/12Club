'use client'

import { useState, useEffect } from 'react'

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  NumberInput,
  Chip,
  useDisclosure
} from '@heroui/react'
import { addToast } from '@heroui/react'
import { Plus, Edit2, ExternalLink } from 'lucide-react'

import { ErrorHandler } from '@/utils/errorHandler'
import { FetchGet, FetchPost, FetchPut, FetchDelete } from '@/utils/fetch'

import { ResourcePlayLinkDelete } from './ResourcePlayLinkDelete'

import type { ResourcePlayLink } from '@/types/api/resource-play-link'

interface Props {
    resourceId: number
    accordionTotal: number
    needUpdate?: boolean
}

interface PlayLinkFormData {
    accordion: number
    showAccordion: string
    link: string
}

export const ResourcePlayLinkManager = ({ resourceId, accordionTotal, needUpdate = false }: Props) => {
  const [playLinks, setPlayLinks] = useState<ResourcePlayLink[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<PlayLinkFormData>({ accordion: playLinks?.length + 1, showAccordion: '', link: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // 获取播放链接列表
  const fetchPlayLinks = async () => {
    setLoading(true)
    const res = await FetchGet<ResourcePlayLink[]>('/admin/resource/playLink', {
      resourceId: resourceId.toString()
    })
    setLoading(false)

    ErrorHandler(res, (response: any) => {
      if (response?.success && Array.isArray(response.data)) {
        setPlayLinks(response.data)
      } else {
        setPlayLinks([])
      }
    })
  }

  useEffect(() => {
    fetchPlayLinks()
  }, [resourceId, needUpdate])

  // 重置表单
  const resetForm = () => {
    setFormData({ accordion: playLinks?.length + 1, showAccordion: '', link: '' })
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

    // 去除播放链接中的 http:// 或 https:// 前缀
    const removeHttpPrefix = (url: string) => {
      return url.replace(/^https?:/, '')
    }

    setLoading(true)

    try {
      if (editingId) {
        // 更新播放链接
        const res = await FetchPut<ResourcePlayLink>('/admin/resource/playLink', {
          id: editingId,
          accordion: formData.accordion,
          showAccordion: formData.showAccordion,
          link: removeHttpPrefix(formData.link.trim())
        })

        ErrorHandler(res, (response: any) => {
          if (response?.success && response.data) {
            setPlayLinks(prev => prev.map(link =>
              link.id === editingId ? response.data : link
            ))
            addToast({
              title: '成功',
              description: '播放链接更新成功',
              color: 'success'
            })
            onClose()
            resetForm()
          }
        })
      } else {
        // 创建新播放链接
        const res = await FetchPost<ResourcePlayLink>('/admin/resource/playLink', {
          resourceId,
          accordion: formData.accordion,
          showAccordion: formData.showAccordion,
          link: removeHttpPrefix(formData.link.trim())
        })

        ErrorHandler(res, (response: any) => {
          if (response?.success && response.data) {
            setPlayLinks(prev => [...prev, response.data].sort((a, b) => a.accordion - b.accordion))
            addToast({
              title: '成功',
              description: '播放链接添加成功',
              color: 'success'
            })
            onClose()
            resetForm()
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
    const res = await FetchDelete('/admin/resource/playLink', { id })
    setLoading(false)

    ErrorHandler(res, () => {
      setPlayLinks(prev => prev.filter(link => link.id !== id))
      addToast({
        title: '成功',
        description: '播放链接删除成功',
        color: 'success'
      })
    })
  }

  // 打开链接
  const handleOpenLink = (link: string) => {
    window.open(link, '_blank')
  }

  const removeHttpPrefix = (url: string) => {
    return url.replace(/^https?:/, '')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">在线播放链接</h3>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => handleOpenModal()}
          isDisabled={loading}
        >
                    添加播放链接
        </Button>
      </div>

      {!playLinks?.length ? (
        <div className="text-center py-8 text-default-500">
                    暂无播放链接
        </div>
      ) : (
        <Table aria-label="播放链接列表">
          <TableHeader>
            <TableColumn>集数序号</TableColumn>
            <TableColumn>显示名称</TableColumn>
            <TableColumn>播放链接</TableColumn>
            <TableColumn>添加者</TableColumn>
            <TableColumn>添加时间</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {playLinks?.map((playLink) => (
              <TableRow key={playLink.id}>
                <TableCell>
                  <Chip color="primary" variant="flat">
                    {playLink.accordion}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip color="primary" variant="flat">
                    {playLink.show_accordion ? playLink.show_accordion : playLink.accordion}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-xs" title={playLink.link}>
                      {playLink.link}
                    </span>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleOpenLink(playLink.link)}
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {playLink.user?.name || '未知用户'}
                </TableCell>
                <TableCell>
                  {new Date(playLink.created).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => handleOpenModal(playLink)}
                      isDisabled={loading}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <ResourcePlayLinkDelete resource={playLink} onDelete={handleDelete} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* 添加/编辑模态框 */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {editingId ? '编辑播放链接' : '添加播放链接'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <NumberInput
                label="集数序号"
                value={formData.accordion}
                onValueChange={(value) => setFormData(prev => ({ ...prev, accordion: value }))}
                min={1}
                description="用于内部排序的集数序号"
              />
              <Input
                label="显示名称"
                placeholder="例如：第11.5集、番外篇等（可选）"
                value={formData.showAccordion}
                onChange={(e) => setFormData(prev => ({ ...prev, showAccordion: e.target.value }))}
                description="不填写将显示默认的集数格式"
              />
              <Input
                label="播放链接"
                placeholder="请输入播放链接"
                value={removeHttpPrefix(formData.link)}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
                            取消
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={loading}
            >
              {editingId ? '更新' : '添加'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
