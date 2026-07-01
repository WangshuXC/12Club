'use client'

import { useState, useEffect } from 'react'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
  Chip,
  Tab,
  Tabs
} from '@heroui/react'
import { Eye, Play } from 'lucide-react'

import {
  getVisitorDetail,
  type VisitorDetail,
  type VisitorPageView,
  type VisitorAnimePlay
} from '@/app/admin/tracking/visitors/detail'

import type { VisitorStats } from '@/app/admin/tracking/visitors/actions'

interface VisitorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  visitor: VisitorStats | null
}

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('zh-CN')

const extractPath = (url: string) => {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

const PageViewList = ({ data }: { data: VisitorPageView[] }) => {
  if (data.length === 0) {
    return <div className="text-center py-8 text-default-400">暂无访问记录</div>
  }

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors"
        >
          <div className="mt-0.5 shrink-0">
            <Eye className="size-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {item.page_title || extractPath(item.page_url)}
            </p>
            <p className="text-xs text-default-400 truncate">
              {extractPath(item.page_url)}
            </p>
            {item.referrer && (
              <p className="text-xs text-default-300 truncate">
                来源: {extractPath(item.referrer)}
              </p>
            )}
          </div>
          <span className="text-xs text-default-400 shrink-0">
            {formatTime(item.timestamp)}
          </span>
        </div>
      ))}
    </div>
  )
}

const AnimePlayList = ({ data }: { data: VisitorAnimePlay[] }) => {
  if (data.length === 0) {
    return <div className="text-center py-8 text-default-400">暂无播放记录</div>
  }

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const extra = item.extra_data
        const animeName =
          (extra?.animeName as string) ||
          item.page_title ||
          extractPath(item.page_url)
        const episode = extra?.episode as string | undefined

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-default-50 hover:bg-default-100 transition-colors"
          >
            <div className="mt-0.5 shrink-0">
              <Play className="size-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{animeName}</p>
              {episode && (
                <Chip size="sm" variant="flat" color="warning" className="mt-1">
                  {episode}
                </Chip>
              )}
            </div>
            <span className="text-xs text-default-400 shrink-0">
              {formatTime(item.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const VisitorDetailModal = ({
  isOpen,
  onClose,
  visitor
}: VisitorDetailModalProps) => {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<VisitorDetail | null>(null)

  useEffect(() => {
    if (isOpen && visitor) {
      setLoading(true)
      getVisitorDetail(visitor.id)
        .then((data) => setDetail(data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [isOpen, visitor])

  const displayName =
    visitor?.user?.name || `游客 ${visitor?.guid.slice(0, 8)}...`

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>访客详情</span>
          <span className="text-sm font-normal text-default-500">
            {displayName}
          </span>
        </ModalHeader>
        <ModalBody className="pb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : detail ? (
            <Tabs aria-label="访客详情" variant="underlined">
              <Tab
                key="pageViews"
                title={
                  <div className="flex items-center gap-1.5">
                    <Eye className="size-4" />
                    <span>访问轨迹</span>
                    <Chip size="sm" variant="flat">
                      {detail.pageViews.length}
                    </Chip>
                  </div>
                }
              >
                <PageViewList data={detail.pageViews} />
              </Tab>
              <Tab
                key="animePlays"
                title={
                  <div className="flex items-center gap-1.5">
                    <Play className="size-4" />
                    <span>动漫播放</span>
                    <Chip size="sm" variant="flat">
                      {detail.animePlays.length}
                    </Chip>
                  </div>
                }
              >
                <AnimePlayList data={detail.animePlays} />
              </Tab>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-default-400">
              加载失败，请重试
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
