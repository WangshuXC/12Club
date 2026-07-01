'use client'

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput
} from '@heroui/react'
import { FolderOpen } from 'lucide-react'

import { removeHttpPrefix } from '@/utils/link'

export interface PlayLinkFormData {
  accordion: number
  showAccordion: string
  link: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  isEditing: boolean
  loading: boolean
  formData: PlayLinkFormData
  onChange: (data: PlayLinkFormData) => void
  onSubmit: () => void
  onOpenFilePicker: () => void
  disableFilePicker: boolean
}

export const PlayLinkEditModal = ({
  isOpen,
  onClose,
  isEditing,
  loading,
  formData,
  onChange,
  onSubmit,
  onOpenFilePicker,
  disableFilePicker
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>{isEditing ? '编辑播放链接' : '添加播放链接'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <NumberInput
              label="集数序号"
              value={formData.accordion}
              onValueChange={(value) =>
                onChange({ ...formData, accordion: value })
              }
              min={1}
              description="用于内部排序的集数序号"
            />
            <Input
              label="显示名称"
              placeholder="例如：第11.5集、番外篇等（可选）"
              value={formData.showAccordion}
              onChange={(e) =>
                onChange({ ...formData, showAccordion: e.target.value })
              }
              description="不填写将显示默认的集数格式"
            />
            <div className="flex items-end gap-2">
              <Input
                label="播放链接"
                placeholder="请输入播放链接"
                value={removeHttpPrefix(formData.link)}
                onChange={(e) =>
                  onChange({ ...formData, link: e.target.value })
                }
              />
              <Button
                color="secondary"
                variant="flat"
                startContent={<FolderOpen size={16} />}
                onPress={onOpenFilePicker}
                isDisabled={disableFilePicker}
              >
                选择文件
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={onSubmit} isLoading={loading}>
            {isEditing ? '更新' : '添加'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
