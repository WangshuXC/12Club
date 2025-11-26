'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardBody,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import Link from 'next/link'
import { CardStatus } from '@/components/common/CoverCard'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPut } from '@/utils/fetch'
import toast from 'react-hot-toast'
import type { ResourceData } from '@/types/api/resource'
import { getRouteByDbId } from '@/utils/router'

interface Props {
  favoriteData: ResourceData
  folderId: number
  onRemoveFavorite: (dbId: string) => void
}

export const UserFavoriteDataCard = ({
  favoriteData,
  folderId,
  onRemoveFavorite
}: Props) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()
  const handleRemoveFavorite = () => {
    startTransition(async () => {
      const res = await FetchPut<{ added: boolean }>(
        `/patch/favorite`,
        { patchId: favoriteData.dbId, folderId }
      )
      ErrorHandler(res, () => {
        onCloseDelete()
        toast.success('取消收藏成功')
        onRemoveFavorite(favoriteData.dbId)
        router.refresh()
      })
    })
  }

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row relative">
          <Link href={getRouteByDbId(favoriteData.dbId)} className="relative w-full sm:h-auto sm:w-40">
            <Image
              src={favoriteData.image}
              alt={favoriteData.title}
              className="object-cover rounded-lg size-full h-52"
              radius="lg"
            />
          </Link>
          <div className="flex-1 space-y-3">
            <Link
              target="_blank"
              href={getRouteByDbId(favoriteData.dbId)}
              className="text-lg font-semibold transition-colors line-clamp-2 hover:text-primary-500"
            >
              {favoriteData.title}
            </Link>

            <CardStatus data={{ ...favoriteData, favorite_by: favoriteData._count.favorite_by }} />

            <div className="flex absolute bottom-0 right-0">
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={onOpenDelete}
                isDisabled={isPending}
                isLoading={isPending}
              >
                从收藏夹移除
              </Button>
            </div>

            <Modal
              isOpen={isOpenDelete}
              onClose={onCloseDelete}
              placement="center"
            >
              <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                  移除资源
                </ModalHeader>
                <ModalBody>您确定要从收藏夹移除这个资源吗</ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onCloseDelete}>
                    取消
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleRemoveFavorite}
                    disabled={isPending}
                    isLoading={isPending}
                  >
                    移除
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
