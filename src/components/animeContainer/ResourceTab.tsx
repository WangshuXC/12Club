'use client'

import { useEffect, useState } from 'react'
import type { JSX } from 'react'

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Tabs,
  Tab,
  useDisclosure
} from '@heroui/react'
import {
  Plus,
  Edit,
  MoreHorizontal,
  Trash2,
  Cloud,
  Link as LinkIcon,
  Database,
  Download
} from 'lucide-react'

import { ExternalLink } from '@/components/common/ExternalLink'
import { Loading } from '@/components/common/Loading'
import {
  SUPPORTED_RESOURCE_SECTION,
  RESOURCE_SECTION_MAP,
  SUPPORTED_RESOURCE_LINK_MAP
} from '@/constants/resource'
import { useUserStore } from '@/store/userStore'
import { FetchDelete, FetchGet, FetchPut } from '@/utils/fetch'

import { EditResourceDialog } from '../detailContainer/resource/edit/EditResourceDialog'
import { PublishResource } from '../detailContainer/resource/publish/PublishResource'

import type { PatchResource } from '@/types/api/patch'

type ResourceSection = (typeof SUPPORTED_RESOURCE_SECTION)[number]

const storageIcons: { [key: string]: JSX.Element } = {
  alist: <Cloud className="size-4" />,
  user: <LinkIcon className="size-4" />
}

interface ResourceTabProps {
  id: string
  needUpdate?: boolean
}

export const ResourceTab = ({ id, needUpdate = false }: ResourceTabProps) => {
  const { user } = useUserStore((state) => state)
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState<PatchResource[]>([])
  const [selectedSection, setSelectedSection] =
    useState<ResourceSection>('club')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const res = await FetchGet<PatchResource[]>('/patch', {
        dbId: id
      })
      setLoading(false)
      setResources(res)
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
    await FetchDelete<object>('/patch', {
      patchId: deleteResourceId
    })
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
    // 如果链接已显示，则隐藏
    if (showLinks[resource.id]) {
      setShowLinks((prev) => ({
        ...prev,
        [resource.id]: false
      }))
      return
    }

    // 统计下载量
    await FetchPut<object>('/patch/download', {
      resourceId: resource.resourceId,
      patchId: resource.id
    })

    // 显示链接
    setShowLinks((prev) => ({
      ...prev,
      [resource.id]: true
    }))
  }

  // 按类别分类资源
  const categorizedResources = SUPPORTED_RESOURCE_SECTION.reduce(
    (acc, section) => {
      acc[section] = resources.filter(
        (resource) => resource.section === section
      )
      return acc
    },
    {} as Record<ResourceSection, PatchResource[]>
  )

  return (
    <Card>
      <CardHeader className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">下载资源</h3>
        </div>

        {/* 添加资源按钮 */}
        <Button
          color="primary"
          variant="light"
          size="sm"
          startContent={<Plus className="size-4" />}
          onPress={onOpenCreate}
        >
          添加
        </Button>
      </CardHeader>

      <CardBody className="px-4 pt-0 pb-4">
        {loading ? (
          <Loading hint="正在获取资源..." />
        ) : (
          <>
            {/* 资源类别切换 */}
            <Tabs
              size="sm"
              variant="underlined"
              selectedKey={selectedSection}
              onSelectionChange={(key) =>
                setSelectedSection(key as ResourceSection)
              }
              classNames={{
                tabList: 'gap-4 pb-2',
                tab: 'px-0'
              }}
            >
              {SUPPORTED_RESOURCE_SECTION.map((section) => (
                <Tab
                  key={section}
                  title={
                    <div className="flex items-center gap-1">
                      <span>{RESOURCE_SECTION_MAP[section]}</span>
                      <span className="text-xs text-default-400">
                        ({categorizedResources[section]?.length ?? 0})
                      </span>
                    </div>
                  }
                />
              ))}
            </Tabs>

            {/* 资源列表 */}
            <ScrollShadow className="max-h-80 mt-2" hideScrollBar>
              <div className="space-y-3">
                {categorizedResources[selectedSection]?.length > 0 ? (
                  categorizedResources[selectedSection].map((resource) => (
                    <div
                      key={resource.id}
                      className="p-3 rounded-lg bg-default-50 space-y-2"
                    >
                      {/* 资源头部 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {resource.name}
                          </p>
                          {resource.note && (
                            <p className="text-xs text-default-500 mt-1 line-clamp-2">
                              {resource.note}
                            </p>
                          )}
                        </div>

                        {/* 操作菜单 */}
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="light"
                              size="sm"
                              isIconOnly
                              className="shrink-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label="资源操作"
                            disabledKeys={
                              user.uid !== resource.userId && user.role < 3
                                ? ['edit', 'delete']
                                : []
                            }
                          >
                            <DropdownItem
                              key="edit"
                              startContent={<Edit className="size-4" />}
                              onPress={() => {
                                setEditResource(resource)
                                onOpenEdit()
                              }}
                            >
                              编辑
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 className="size-4" />}
                              onPress={() => {
                                setDeleteResourceId(resource.id)
                                onOpenDelete()
                              }}
                            >
                              删除
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>

                      {/* 资源标签和下载按钮 */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            size="sm"
                            color="secondary"
                            variant="flat"
                            startContent={storageIcons[resource.storage]}
                          >
                            {
                              SUPPORTED_RESOURCE_LINK_MAP[
                                resource.storage as 'alist' | 'user'
                              ]
                            }
                          </Chip>
                          {resource.size && (
                            <Chip
                              size="sm"
                              variant="flat"
                              startContent={<Database className="size-3" />}
                            >
                              {resource.size}
                            </Chip>
                          )}
                        </div>

                        {/* 下载按钮 */}
                        <Button
                          color="primary"
                          size="sm"
                          isIconOnly
                          variant={showLinks[resource.id] ? 'solid' : 'flat'}
                          aria-label="下载资源"
                          onPress={() => handleClickDownload(resource)}
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>

                      {/* 下载链接 - 点击下载按钮后显示 */}
                      {showLinks[resource.id] && (
                        <div className="space-y-1 pt-2 border-t border-default-200">
                          <p className="text-xs text-default-500">
                            点击下面的链接以下载
                          </p>
                          {resource.content.split(',').map((link, index) => (
                            <ExternalLink
                              key={index}
                              underline="hover"
                              link={link}
                              className="text-xs break-all w-full"
                            >
                              <span className="w-full text-ellipsis overflow-hidden whitespace-nowrap">
                                {link}
                              </span>
                            </ExternalLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-default-500 text-sm">
                    暂无 {RESOURCE_SECTION_MAP[selectedSection]}
                  </div>
                )}
              </div>
            </ScrollShadow>
          </>
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
        classNames={{
          wrapper: 'z-[9999]',
          backdrop: 'z-[9998]'
        }}
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
        classNames={{
          wrapper: 'z-[9999]',
          backdrop: 'z-[9998]'
        }}
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
        classNames={{
          wrapper: 'z-[9999]',
          backdrop: 'z-[9998]'
        }}
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
