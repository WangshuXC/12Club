'use client'

import { useState } from 'react'

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import toast from 'react-hot-toast'

import { ImageCropper } from '@/components/common/cropper/ImageCropper'
import { dataURItoBlob } from '@/utils/dataURItoBlob'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchFormData } from '@/utils/fetch'

interface Props {
  resourceId: number
}

export const RewriteResourceBanner = ({ resourceId }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [banner, setBanner] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const removeBanner = async () => {
    setPreviewUrl('')
    setBanner(null)
  }

  const [updating, setUpdating] = useState(false)
  const handleUpdateBanner = async () => {
    if (!banner) {
      toast.error('请选择一张新的预览图片')
      return
    }

    const formData = new FormData()
    formData.append('resourceId', resourceId.toString())
    formData.append('image', banner)

    setUpdating(true)

    const res = await FetchFormData<object>('/admin/resource/banner', formData)
    ErrorHandler(res, () => {
      setBanner(null)
      setPreviewUrl('')
    })
    toast.success('更新图片成功')
    setUpdating(false)
    onClose()
  }

  const onImageComplete = async (croppedImage: string) => {
    const imageBlob = dataURItoBlob(croppedImage)
    setPreviewUrl(URL.createObjectURL(imageBlob))
    setBanner(imageBlob)
  }

  return (
    <>
      <Button
        color="default"
        variant="shadow"
        size="sm"
        className="absolute z-10 bottom-3 left-3 backdrop-blur-sm bg-background/40"
        onPress={onOpen}
      >
        更改图片
      </Button>
      <Modal isOpen={isOpen} size="2xl" onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            更改预览图片
          </ModalHeader>
          <ModalBody>
            <ImageCropper
              initialImage={previewUrl}
              cropperClassName="max-w-96"
              onImageComplete={onImageComplete}
              removeImage={removeBanner}
            />

            <p>更改图片后立即生效, 使用 Ctrl + F5 刷新页面即可</p>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleUpdateBanner}
              disabled={updating}
              isLoading={updating}
            >
              更改
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
