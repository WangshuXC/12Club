'use client'

import { useState, useCallback } from 'react'
import { Button, Card, CardBody, Image, Chip, Divider } from '@heroui/react'
import { Plus, Trash2 } from 'lucide-react'
import { ResourceSelector } from './ResourceSelector'
import type { AdminSeriesResource } from '@/types/api/admin'

interface SeriesResourceManagerProps {
  resources: AdminSeriesResource[]
  onResourcesChange: (resources: AdminSeriesResource[]) => void
}

export const SeriesResourceManager = ({
  resources,
  onResourcesChange
}: SeriesResourceManagerProps) => {
  const [showSelector, setShowSelector] = useState(false)
  const [selectedResources, setSelectedResources] = useState<
    AdminSeriesResource[]
  >([])
  const [error, setError] = useState('')

  // 添加选中的资源到列表（仅前端操作）
  const handleAddResources = useCallback(() => {
    if (selectedResources.length === 0) {
      setError('请选择要添加的资源')
      return
    }

    // 合并资源，避免重复
    const existingDbIds = new Set(resources.map((r) => r.dbId))
    const newResources = selectedResources.filter(
      (r) => !existingDbIds.has(r.dbId)
    )

    if (newResources.length === 0) {
      setError('所选资源已在系列中')
      return
    }

    onResourcesChange([...resources, ...newResources])
    setShowSelector(false)
    setSelectedResources([])
    setError('')
  }, [selectedResources, resources, onResourcesChange])

  // 从列表移除资源（仅前端操作）
  const handleRemoveResource = useCallback(
    (dbId: string) => {
      if (resources.length <= 1) {
        setError('系列至少需要包含一个资源')
        return
      }

      onResourcesChange(resources.filter((r) => r.dbId !== dbId))
      setError('')
    },
    [resources, onResourcesChange]
  )

  // 获取资源状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '连载中'
      case 1:
        return '已完结'
      case 2:
        return '已停更'
      default:
        return '未知'
    }
  }

  // 获取资源状态颜色
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'warning'
      case 1:
        return 'success'
      case 2:
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* 当前系列资源 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">
            系列资源 ({resources.length})
          </h4>
          {!showSelector && (
            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onPress={() => setShowSelector(true)}
            >
              添加资源
            </Button>
          )}
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-default-500">该系列暂无资源</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <Card key={resource.dbId}>
                <CardBody className="p-3">
                  <div className="flex gap-3">
                    <Image
                      src={resource.banner}
                      alt={resource.name}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h5
                        className="font-medium text-sm truncate"
                        title={resource.name}
                      >
                        {resource.name}
                      </h5>
                      <p className="text-xs text-default-500 mt-1">
                        {resource.dbId}
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
                      isDisabled={resources.length <= 1}
                      title={
                        resources.length <= 1
                          ? '系列至少需要包含一个资源'
                          : '移除资源'
                      }
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
                    setSelectedResources([])
                  }}
                >
                  取消
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddResources}
                  isDisabled={selectedResources.length === 0}
                >
                  添加选中资源
                </Button>
              </div>
            </div>

            <ResourceSelector
              selectedResources={selectedResources}
              onSelectionChange={setSelectedResources}
              excludeDbIds={resources.map((r) => r.dbId)}
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
