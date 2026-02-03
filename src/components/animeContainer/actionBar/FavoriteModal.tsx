'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Chip
} from '@heroui/react'
import { Folder } from 'lucide-react'
import { EditFolderModal } from '@/components/user/favorite/EditFolderModal'
import { FetchGet, FetchPut } from '@/utils/fetch'
import { ErrorHandler } from '@/utils/errorHandler'
import toast from 'react-hot-toast'
import type { UserFavoriteResourceFolder } from '@/types/api/user'
import type { FavoriteToggleResponse } from '@/types/api/resource'

interface FavoriteModalProps {
  dbId: string
  isOpen: boolean
  onClose: () => void
}

// 收藏弹窗内容组件
const FavoriteModalContent = ({
  dbId,
  isOpen
}: {
  dbId: string
  isOpen: boolean
}) => {
  const [folders, setFolders] = useState<UserFavoriteResourceFolder[]>([])
  const [isPending, startTransition] = useTransition()

  const fetchFolders = async () => {
    const response = await FetchGet<UserFavoriteResourceFolder[]>(
      '/user/profile/favorite/folder',
      { dbId }
    )
    setFolders(response)
  }

  useEffect(() => {
    if (isOpen) {
      fetchFolders()
    }
  }, [isOpen])

  const handleAddToFolder = async (folderId: number) => {
    startTransition(async () => {
      const res = await FetchPut<FavoriteToggleResponse>(`/detail/favorite`, {
        dbId,
        folderId
      })
      ErrorHandler(res, (value: FavoriteToggleResponse) => {
        toast.success(value.added ? '收藏成功' : '取消收藏成功')
        fetchFolders()
      })
    })
  }

  return (
    <ModalBody className="py-6">
      <div className="space-y-4">
        <h2>
          <p className="text-lg font-bold">添加到收藏夹</p>
          <p className="text-sm text-default-500">
            点击文件夹收藏, 再次点击取消收藏
          </p>
        </h2>

        <EditFolderModal
          action="create"
          onActionSuccess={(value) => setFolders([...folders, value])}
        />

        {folders.map((folder) => (
          <Button
            key={folder.id}
            startContent={<Folder className="w-4 h-4" />}
            variant="bordered"
            fullWidth
            className="justify-between"
            onPress={() => handleAddToFolder(folder.id)}
            isLoading={isPending}
            isDisabled={isPending}
          >
            <span>{folder.name}</span>
            <Chip size="lg">
              {folder.isAdd
                ? '本资源已添加'
                : `${folder._count.resource} 个资源`}
            </Chip>
          </Button>
        ))}
      </div>
    </ModalBody>
  )
}

export const FavoriteModal = ({ dbId, isOpen, onClose }: FavoriteModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998]'
      }}
      backdrop="blur"
    >
      <ModalContent>
        <FavoriteModalContent dbId={dbId} isOpen={isOpen} />
      </ModalContent>
    </Modal>
  )
}
