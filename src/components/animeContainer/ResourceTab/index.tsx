'use client'

import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  addToast,
  useDisclosure
} from '@heroui/react'

import { FetchDelete, FetchGet, FetchPost, FetchPut } from '@/utils/fetch'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'

import { EditResourceDialog } from '../../detailContainer/resource/edit/EditResourceDialog'
import { PublishResource } from '../../detailContainer/resource/publish/PublishResource'

import { OfficialEpisodes } from './OfficialEpisodes'
import { ResourceFilter } from './ResourceFilter'
import { ResourceItem } from './ResourceItem'

import type { ViewMode } from './types'
import type { PatchResource } from '@/types/api/patch'
import type { PlayListItem } from '@/types/common/detail-container'

interface ResourceTabProps {
  id: string
  playList: PlayListItem[]
  needUpdate?: boolean
}

export const ResourceTab = ({
  id,
  playList,
  needUpdate = false
}: ResourceTabProps) => {
  const { trackCustom } = useTrackingContext()
  const [resources, setResources] = useState<PatchResource[]>([])
  const [individualLoaded, setIndividualLoaded] = useState(false)

  // 官方下载：分集选择相关状态
  const [isAscending, setIsAscending] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // 个人资源后台加载，不显示 loading
  useEffect(() => {
    const fetchData = async () => {
      const res = await FetchGet<PatchResource[]>('/patch', { dbId: id })
      setResources(res)
      setIndividualLoaded(true)
    }
    fetchData()
  }, [id, needUpdate])

  const {
    isOpen: isOpenCreate,
    onOpen: onOpenCreate,
    onClose: onCloseCreate
  } = useDisclosure()

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure()
  const [editResource, setEditResource] = useState<PatchResource | null>(null)

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()
  const [deleteResourceId, setDeleteResourceId] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [showLinks, setShowLinks] = useState<Record<number, boolean>>({})

  const handleDeleteResource = async () => {
    setDeleting(true)
    await FetchDelete<object>('/patch', { patchId: deleteResourceId })
    setResources((prev) =>
      prev.filter((resource) => resource.id !== deleteResourceId)
    )
    setDeleteResourceId(0)
    setDeleting(false)
    onCloseDelete()
    addToast({
      title: '成功',
      description: '删除资源链接成功',
      color: 'success'
    })
  }

  // 点击下载按钮，统计下载量并显示链接
  const handleClickDownload = async (resource: PatchResource) => {
    if (showLinks[resource.id]) {
      setShowLinks((prev) => ({ ...prev, [resource.id]: false }))
      return
    }

    await FetchPut<object>('/patch/download', {
      resourceId: resource.resourceId,
      patchId: resource.id
    })
    setShowLinks((prev) => ({ ...prev, [resource.id]: true }))
    trackCustom('download_reveal', {
      dbid: id,
      patch_id: resource.id,
      storage: resource.storage
    })
  }

  // 点击官方分集下载按钮，使用隐藏 a 标签触发下载避免弹窗闪烁
  const handleEpisodeDownload = (item: PlayListItem) => {
    if (item.link) {
      const a = document.createElement('a')
      a.href = item.link
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      FetchPost<object>('/detail/download', { resourceDbId: id })
      trackCustom('official_download_click', {
        dbid: id,
        episode: item.accordion
      })
    }
  }

  // 个人资源列表
  const individualResources = resources.filter(
    (resource) => resource.section === 'individual'
  )

  // 排序后的播放列表
  const sortedPlayList = isAscending ? [...playList] : [...playList].reverse()

  return (
    <Card>
      <ResourceFilter
        playListCount={playList.length}
        viewMode={viewMode}
        isAscending={isAscending}
        onOpenCreate={() => {
          trackCustom('resource_publish_open', { dbid: id })
          onOpenCreate()
        }}
        onToggleViewMode={() => {
          const nextViewMode = viewMode === 'grid' ? 'list' : 'grid'
          setViewMode(nextViewMode)
          trackCustom('download_view_mode_change', {
            dbid: id,
            view_mode: nextViewMode
          })
        }}
        onToggleSortOrder={() => {
          const nextAscending = !isAscending
          setIsAscending(nextAscending)
          trackCustom('download_sort_change', {
            dbid: id,
            sort_order: nextAscending ? 'asc' : 'desc'
          })
        }}
      />

      <CardBody className="px-4 pt-0 pb-4 space-y-4">
        {/* 官方资源 - 分集下载 */}
        {playList.length > 0 && (
          <div>
            <OfficialEpisodes
              sortedPlayList={sortedPlayList}
              viewMode={viewMode}
              onEpisodeDownload={handleEpisodeDownload}
            />
          </div>
        )}

        {/* 个人资源 - 后台加载完成后展示 */}
        {individualLoaded && individualResources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">个人资源</span>
              <span className="text-xs text-default-400">
                ({individualResources.length})
              </span>
            </div>

            <ScrollShadow className="max-h-80" hideScrollBar>
              <div className="space-y-3">
                {individualResources.map((resource) => (
                  <ResourceItem
                    key={resource.id}
                    resource={resource}
                    showLinks={!!showLinks[resource.id]}
                    onEdit={(res) => {
                      setEditResource(res)
                      onOpenEdit()
                    }}
                    onDelete={(resId) => {
                      setDeleteResourceId(resId)
                      onOpenDelete()
                    }}
                    onDownload={handleClickDownload}
                    onDownloadLinkClick={(res, linkIndex) =>
                      trackCustom('download_link_click', {
                        dbid: id,
                        patch_id: res.id,
                        storage: res.storage,
                        link_index: linkIndex
                      })
                    }
                  />
                ))}
              </div>
            </ScrollShadow>
          </div>
        )}

        {/* 无数据提示 */}
        {playList.length === 0 &&
          individualLoaded &&
          individualResources.length === 0 && (
            <div className="py-8 text-center text-default-500 text-sm">
              暂无下载资源
            </div>
          )}
      </CardBody>

      {/* 创建资源弹窗 */}
      <Modal
        size="2xl"
        isOpen={isOpenCreate}
        onClose={onCloseCreate}
        scrollBehavior="inside"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        classNames={{ wrapper: 'z-[9999]', backdrop: 'z-[9998]' }}
        backdrop="blur"
      >
        <PublishResource
          dbId={id}
          onClose={onCloseCreate}
          onSuccess={(res) => {
            setResources([...resources, res])
            onCloseCreate()
          }}
        />
      </Modal>

      {/* 编辑资源弹窗 */}
      <Modal
        size="2xl"
        isOpen={isOpenEdit}
        onClose={onCloseEdit}
        scrollBehavior="inside"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        classNames={{ wrapper: 'z-[9999]', backdrop: 'z-[9998]' }}
        backdrop="blur"
      >
        <EditResourceDialog
          onClose={onCloseEdit}
          resource={editResource!}
          onSuccess={(res) => {
            setResources((prevResources) =>
              prevResources.map((resource) =>
                resource.id === res.id ? res : resource
              )
            )
            onCloseEdit()
          }}
        />
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={isOpenDelete}
        onClose={onCloseDelete}
        placement="center"
        classNames={{ wrapper: 'z-[9999]', backdrop: 'z-[9998]' }}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>删除资源链接</ModalHeader>
          <ModalBody>
            <p>您确定要删除这条资源链接吗，该操作不可撤销</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteResource}
              disabled={deleting}
              isLoading={deleting}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  )
}
