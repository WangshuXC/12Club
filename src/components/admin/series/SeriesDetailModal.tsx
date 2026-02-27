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

import type { AdminSeries } from '@/types/api/admin'

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
  // 获取资源状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '连载中'
      case 1:
        return '已完结'
      case 2:
        return '老站数据'
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
        return 'primary'
      case 2:
        return 'danger'
      default:
        return 'default'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
            {series?.resources?.map((resource) => {
              return (
                <Card key={resource.id} className="shadow-md">
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
