'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Card,
  CardBody,
  Image,
  Chip,
  Spinner
} from '@heroui/react'
import { FetchGet } from '@/utils/fetch'
import type { AdminSeries, AdminSeriesResource } from '@/types/api/admin'
import { getRouteByDbId } from '@/utils/router'
import Link from 'next/link'

interface SeriesDetailModalProps {
  series: AdminSeries | null
  isOpen: boolean
  onClose: () => void
}

export const SeriesDetailModal = ({
  series,
  isOpen,
  onClose
}: SeriesDetailModalProps) => {
  const [resources, setResources] = useState<AdminSeriesResource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  // 获取类型标签
  const getTypeLabel = (dbId: string) => {
    const prefix = dbId.charAt(0).toLowerCase()
    switch (prefix) {
      case 'a':
        return { label: '动漫', color: 'primary' }
      case 'c':
        return { label: '漫画', color: 'secondary' }
      case 'g':
        return { label: '游戏', color: 'success' }
      case 'n':
        return { label: '轻小说', color: 'warning' }
      default:
        return { label: '未知', color: 'default' }
    }
  }

  useEffect(() => {
    if (isOpen && series) {
      fetchSeriesResources()
    }
  }, [isOpen, series])

  const fetchSeriesResources = async () => {
    if (!series) return

    setLoading(true)
    setError('')

    try {
      const data = await FetchGet<any>('/admin/seriesDetail', { id: series.id })

      if (typeof data === 'string') {
        setError(data)
        return
      }

      if (data.series) {
        setResources(data.series.resources || [])
      }
    } catch (error) {
      console.error('获取系列资源失败:', error)
      setError('获取系列资源失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>{series?.name}</span>
          {series?.description && (
            <span className="text-sm font-normal text-default-500">
              {series.description}
            </span>
          )}
        </ModalHeader>
        <ModalBody className="pb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger text-sm">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
              {resources.map((resource) => {
                return (
                  <Card key={resource.id} className="shadow-md">
                    <CardBody className="p-3">
                      <div className="flex gap-3">
                        <Image
                          src={resource.banner}
                          alt={resource.name}
                          className="w-16 h-20 object-cover rounded"
                          fallbackSrc="/placeholder-image.jpg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5
                            className="font-medium text-sm truncate"
                            title={resource.name}
                          >
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
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
