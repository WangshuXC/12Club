'use client'

import { useState } from 'react'

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  NumberInput,
  useDisclosure,
  Checkbox
} from '@heroui/react'
import { Edit2 } from 'lucide-react'

import { SelfUser } from '@/components/common/user-card/User'
import { Resources } from '@/components/detailContainer/resource/Resources'
import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPut } from '@/utils/fetch'

import { AdminAliasInput } from './AdminAliasInput'
import { AdminLanguageSelect } from './AdminLanguageSelect'
import { AdminReleasedDateInput } from './AdminReleasedDateInput'
import { AdminTagInput } from './AdminTagInput'
import { AutoPlayUrl } from './AutoPlayUrl'
import { GetBangumiData } from './GetBangumiData'
import { ResourcePlayLinkManager } from './ResourcePlayLinkManager'

import type { AdminResource } from '@/types/api/admin'

interface Props {
  initialResource: AdminResource
  onUpdate?: (
    resourceId: number,
    updatedResource: Partial<AdminResource>
  ) => void
}

export const ResourceEdit = ({ initialResource, onUpdate }: Props) => {
  const [resource, setResource] = useState<AdminResource>(initialResource)
  const [aliases, setAliases] = useState<string[]>(
    initialResource.aliases || []
  )
  const [tags, setTags] = useState<string[]>(initialResource.tags || [])
  const [needUpdate, setNeedUpdate] = useState(false)
  const currentUser = useUserStore((state) => state.user)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleChange = (key: keyof AdminResource, value: any) => {
    setResource((prev) => ({ ...prev, [key]: value }))
  }

  const [updating, setUpdating] = useState(false)
  const handleUpdateResource = async () => {
    const requestData = {
      id: resource.id,
      name: resource.name,
      dbId: resource.dbId,
      author: resource.author,
      translator: resource.translator,
      introduction: resource.introduction,
      released: resource.released,
      accordionTotal: resource.accordionTotal,
      language: resource.language,
      status: resource.status,
      aliases: aliases,
      tags: tags
    }

    setUpdating(true)
    const res = await FetchPut<AdminResource>('/admin/resource', requestData)
    setUpdating(false)

    ErrorHandler(res, () => {
      addToast({
        title: '成功',
        description: '更新资源成功',
        color: 'success'
      })

      if (onUpdate) {
        onUpdate(resource.id, {
          name: resource.name,
          dbId: resource.dbId,
          author: resource.author,
          translator: resource.translator,
          introduction: resource.introduction,
          released: resource.released,
          accordionTotal: resource.accordionTotal,
          language: resource.language,
          status: resource.status,
          aliases: aliases,
          tags: tags
        })
      }

      onClose()
    })
  }

  return (
    <>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={onOpen}
        isDisabled={currentUser.role < 3}
      >
        <Edit2 size={16} />
      </Button>

      <Modal
        size="5xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>编辑资源: {resource.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="flex flex-col items-start gap-4">
                <label className="text-sm font-medium">资源上传者</label>
                <SelfUser
                  user={resource.user}
                  userProps={{
                    name: resource.user.name,
                    avatarProps: {
                      src: resource.user.avatar
                    }
                  }}
                />
              </div>

              {/* 资源DBID */}
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="资源DBID"
                  value={resource.dbId}
                  onChange={(e) => handleChange('dbId', e.target.value)}
                />
              </div>

              {/* 资源名称和总集数 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="资源名称"
                  value={resource.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <NumberInput
                  label="总集数"
                  value={resource.accordionTotal}
                  onValueChange={(value) =>
                    handleChange('accordionTotal', value)
                  }
                />
              </div>

              {/* 资源作者和汉化组 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="资源作者"
                  value={resource.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                />
                <Input
                  label="汉化组"
                  value={resource.translator}
                  onChange={(e) => handleChange('translator', e.target.value)}
                />
              </div>

              {/* 语言和发布日期 */}
              <div className="grid grid-cols-2 gap-4">
                <AdminLanguageSelect
                  language={resource.language}
                  onChange={(language) => handleChange('language', language)}
                />
                <AdminReleasedDateInput
                  date={resource.released}
                  onChange={(date) => handleChange('released', date)}
                />
              </div>

              {/* 资源状态 */}
              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  isSelected={resource.status === 1}
                  onValueChange={(value) =>
                    handleChange('status', value ? 1 : 0)
                  }
                >
                  是否完结
                </Checkbox>
              </div>

              {/* 资源介绍 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">资源介绍</label>
                <Textarea
                  minRows={4}
                  maxRows={8}
                  value={resource.introduction}
                  onChange={(e) => handleChange('introduction', e.target.value)}
                />
              </div>

              {/* 别名 */}
              <AdminAliasInput aliases={aliases} onChange={setAliases} />

              {/* 标签 */}
              <AdminTagInput tags={tags} onChange={setTags} />

              {/* 在线播放链接 */}
              {resource.dbId.startsWith('a') && (
                <ResourcePlayLinkManager
                  resourceId={resource.id}
                  accordionTotal={resource.accordionTotal}
                  needUpdate={needUpdate}
                />
              )}

              {/* 下载资源 */}
              <div className="space-y-2 relative">
                <label className="text-sm font-medium absolute left-0 top-2">
                  下载资源
                </label>
                <Resources id={resource.dbId} needUpdate={needUpdate} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col justify-end gap-2 w-full">
              {/* 统计信息展示 */}
              <div className="bg-default-50 rounded-xl p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {resource.view}
                    </p>
                    <p className="text-sm text-default-500">浏览量</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {resource.download}
                    </p>
                    <p className="text-sm text-default-500">下载量</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">
                      {resource.comment}
                    </p>
                    <p className="text-sm text-default-500">评论数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-danger">
                      {resource.favorite_by}
                    </p>
                    <p className="text-sm text-default-500">收藏数</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <AutoPlayUrl
                  resource={resource}
                  setNeedUpdate={setNeedUpdate}
                />
                <GetBangumiData
                  name={resource.name}
                  setData={setResource}
                  setAliases={setAliases}
                />
                <div className="flex gap-2">
                  <Button color="danger" variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button
                    color="primary"
                    isDisabled={updating}
                    isLoading={updating}
                    onPress={handleUpdateResource}
                  >
                    保存修改
                  </Button>
                </div>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
