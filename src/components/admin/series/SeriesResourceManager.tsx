'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Button,
  Card,
  CardBody,
  Image,
  Chip,
  Spinner,
  Divider
} from '@heroui/react'
import { Plus, Trash2 } from 'lucide-react'
import { ResourceSelector } from './ResourceSelector'
import { FetchGet, FetchPost, FetchDelete } from '@/utils/fetch'
import type { AdminSeriesResource } from '@/types/api/admin'

interface SeriesResourceManagerProps {
  seriesId: number
  onResourcesChange: () => void
}

export const SeriesResourceManager = ({
  seriesId,
  onResourcesChange
}: SeriesResourceManagerProps) => {
  const [resources, setResources] = useState<AdminSeriesResource[]>([])
  const [loading, setLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(false)
  const [selectedDbIds, setSelectedDbIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  // 使用 ref 来追踪是否已初始化加载
  const isInitialized = useRef(false)

  // 获取系列资源
  const fetchSeriesResources = useCallback(async () => {
    setLoading(true)
    try {
      const data = await FetchGet<any>('/admin/seriesDetail', { id: seriesId })

      if (typeof data === 'string') {
        setError(data)
        return
      }

      // API返回的数据结构包含资源信息
      if (data.series) {
        setResources(data.series.resources || [])
      }
    } catch (error) {
      console.error('获取系列资源失败:', error)
      setError('获取系列资源失败')
    } finally {
      setLoading(false)
    }
  }, [seriesId])

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      fetchSeriesResources()
    }
  }, [fetchSeriesResources])

  // 添加资源到系列
  const handleAddResources = async () => {
    if (selectedDbIds.length === 0) {
      setError('请选择要添加的资源')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await FetchPost<any>(`/admin/series/${seriesId}/resources`, {
        seriesId,
        dbIds: selectedDbIds
      })

      if (typeof response === 'string') {
        setError(response)
        return
      }

      if (response.success) {
        setShowSelector(false)
        setSelectedDbIds([])
        fetchSeriesResources()
        onResourcesChange()
      } else {
        setError(response.message || '添加资源失败')
      }
    } catch (error) {
      console.error('添加资源失败:', error)
      setError('添加资源时发生错误')
    } finally {
      setActionLoading(false)
    }
  }

  // 从系列移除资源
  const handleRemoveResource = async (dbId: string) => {
    if (resources.length <= 1) {
      setError('系列至少需要包含一个资源')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const response = await FetchDelete<any>(`/admin/series/${seriesId}/resources`, {
        seriesId,
        dbId
      })

      if (typeof response === 'string') {
        setError(response)
        return
      }

      if (response.success) {
        fetchSeriesResources()
        onResourcesChange()
      } else {
        setError(response.message || '移除资源失败')
      }
    } catch (error) {
      console.error('移除资源失败:', error)
      setError('移除资源时发生错误')
    } finally {
      setActionLoading(false)
    }
  }

  // 获取资源状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '连载中'
      case 1: return '已完结'
      case 2: return '已停更'
      default: return '未知'
    }
  }

  // 获取资源状态颜色
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'warning'
      case 1: return 'success'
      case 2: return 'danger'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 当前系列资源 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">
            系列资源 ({resources.length})
          </h4>
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => setShowSelector(!showSelector)}
            isDisabled={actionLoading}
          >
            添加资源
          </Button>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-default-500">该系列暂无资源</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardBody className="p-3">
                  <div className="flex gap-3">
                    <Image
                      src={resource.banner}
                      alt={resource.name}
                      className="w-16 h-20 object-cover rounded"
                      fallbackSrc="/placeholder-image.jpg"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate" title={resource.name}>
                        {resource.name}
                      </h5>
                      <p className="text-xs text-default-500 mt-1">
                        ID: {resource.dbId}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(resource.status) as any}
                          variant="flat"
                        >
                          {getStatusText(resource.status)}
                        </Chip>
                      </div>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveResource(resource.dbId)}
                      isDisabled={actionLoading || resources.length <= 1}
                      title={resources.length <= 1 ? '系列至少需要包含一个资源' : '移除资源'}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 资源选择器 */}
      {showSelector && (
        <>
          <Divider />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">选择要添加的资源</h4>
              <div className="flex gap-2">
                <Button
                  variant="light"
                  onPress={() => {
                    setShowSelector(false)
                    setSelectedDbIds([])
                  }}
                  isDisabled={actionLoading}
                >
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddResources}
                  isLoading={actionLoading}
                  isDisabled={selectedDbIds.length === 0}
                >
                  添加选中资源
                </Button>
              </div>
            </div>

            <ResourceSelector
              selectedDbIds={selectedDbIds}
              onSelectionChange={setSelectedDbIds}
              excludeDbIds={resources.map(r => r.dbId)}
            />
          </div>
        </>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}