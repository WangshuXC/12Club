'use client'

import { useState, useEffect } from 'react'

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Input
} from '@heroui/react'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebounce } from 'use-debounce'

import { Loading } from '@/components/common/Loading'
import { FetchGet, FetchPost } from '@/utils/fetch'

import type { AdminResource } from '@/types/api/admin'

interface Props {
  onSuccess: () => void
}

export const AddResourceModal = ({ onSuccess }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery] = useDebounce(searchQuery, 500)
  const [resources, setResources] = useState<AdminResource[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResources([])
      return
    }

    try {
      setLoading(true)
      const { resources } = await FetchGet<{
        resources: AdminResource[]
        total: number
      }>('/admin/resource', {
        page: 1,
        limit: 10,
        search: query
      })
      setResources(resources)
    } catch (error) {
      toast.error('搜索失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  const handleAddResource = async (resourceId: number) => {
    try {
      setSubmitting(true)
      const response = await FetchPost<{
        success: boolean
        message: string
      }>('/admin/auto-update', { resourceId })

      if (response.success) {
        toast.success(response.message)
        onSuccess()
        onOpenChange()
        setSearchQuery('')
        setResources([])
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        color="primary"
        startContent={<Plus className="w-4 h-4" />}
        onPress={onOpen}
      >
        添加资源
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>添加资源到自动更新列表</ModalHeader>
              <ModalBody>
                <Input
                  placeholder="搜索资源名称或ID..."
                  startContent={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  isClearable
                  onClear={() => {
                    setSearchQuery('')
                    setResources([])
                  }}
                />

                <div className="flex flex-col gap-2 mt-4">
                  {loading && <Loading hint="搜索中..." />}

                  {!loading && resources.length === 0 && searchQuery && (
                    <p className="text-center text-foreground-500">
                      没有找到相关资源
                    </p>
                  )}

                  {!loading && resources.length === 0 && !searchQuery && (
                    <p className="text-center text-foreground-500">
                      请输入资源名称或ID进行搜索
                    </p>
                  )}

                  {!loading &&
                    resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-3 border border-divider rounded-lg hover:bg-default-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={resource.banner}
                            alt={resource.name}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-semibold">{resource.name}</p>
                            <p className="text-xs text-foreground-500">
                              {resource.dbId}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => handleAddResource(resource.id)}
                          isLoading={submitting}
                        >
                          添加
                        </Button>
                      </div>
                    ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
