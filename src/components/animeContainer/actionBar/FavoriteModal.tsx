'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Chip
} from '@heroui/react'
import { Folder } from 'lucide-react'

import { EditFolderModal } from '@/components/user/favorite/EditFolderModal'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchGet, FetchPut } from '@/utils/fetch'

import type { FavoriteToggleResponse } from '@/types/api/resource'
import type { UserFavoriteResourceFolder } from '@/types/api/user'

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
  const { trackCustom } = useTrackingContext()

  const fetchFolders = useCallback(async () => {
    const response = await FetchGet<UserFavoriteResourceFolder[]>(
      '/user/profile/favorite/folder',
      { dbId }
    )
    setFolders(response)
  }, [dbId])

  useEffect(() => {
    if (isOpen) {
      fetchFolders()
    }
  }, [isOpen, fetchFolders])

  const handleAddToFolder = async (folderId: number) => {
    startTransition(async () => {
      const res = await FetchPut<FavoriteToggleResponse>(`/detail/favorite`, {
        dbId,
        folderId
      })
      ErrorHandler(res, (value: FavoriteToggleResponse) => {
        addToast({
          title: value.added ? '收藏成功' : '取消收藏成功',
          color: 'success'
        })
        trackCustom('favorite_success', {
          dbid: dbId,
          folder_id: folderId,
          action: value.added ? 'add' : 'remove'
        })
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

export const FavoriteModal = ({
  dbId,
  isOpen,
  onClose
}: FavoriteModalProps) => {
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
