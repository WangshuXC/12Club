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
  useDisclosure
} from '@heroui/react'
import { Edit2 } from 'lucide-react'
import { FetchPut } from '@/utils/fetch'
import { ErrorHandler } from '@/utils/errorHandler'
import { useUserStore } from '@/store/userStore'
import { AdminAliasInput } from './AdminAliasInput'
import { AdminLanguageSelect } from './AdminLanguageSelect'
import { AdminReleasedDateInput } from './AdminReleasedDateInput'
import type { AdminResource } from '@/types/api/admin'

interface Props {
  initialResource: AdminResource
  onUpdate?: (resourceId: number, updatedResource: Partial<AdminResource>) => void
}

export const ResourceEdit = ({ initialResource, onUpdate }: Props) => {
  const [resource, setResource] = useState<AdminResource>(initialResource)
  const [aliases, setAliases] = useState<string[]>(initialResource.aliases || [])
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
      introduction: resource.introduction,
      released: resource.released,
      accordionTotal: resource.accordionTotal,
      language: resource.language,
      status: resource.status,
      aliases: aliases
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
          introduction: resource.introduction,
          released: resource.released,
          accordionTotal: resource.accordionTotal,
          language: resource.language,
          status: resource.status,
          aliases: aliases
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

      <Modal size="5xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>编辑资源: {resource.name}</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="资源名称"
                  value={resource.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <NumberInput
                  label="总集数"
                  value={resource.accordionTotal}
                  onValueChange={(value) => handleChange('accordionTotal', value)}
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
              <AdminAliasInput
                aliases={aliases}
                onChange={setAliases}
              />

              {/* 统计信息展示 */}
              <div className="bg-default-50 rounded-lg p-4">
                <h3 className="font-medium mb-4">资源统计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{resource.view}</p>
                    <p className="text-sm text-default-500">浏览量</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{resource.download}</p>
                    <p className="text-sm text-default-500">下载量</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warning">{resource.comment}</p>
                    <p className="text-sm text-default-500">评论数</p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
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
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
} 