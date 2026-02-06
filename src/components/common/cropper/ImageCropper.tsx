'use client'

import { useState, useEffect } from 'react'

import { Button, Card, CardBody, Image, useDisclosure } from '@heroui/react'

import { cn } from '@/lib/utils'

import { ImageCropperModal } from './ImageCropperModal'
import { ImageMosaicModal } from './ImageMosaicModal'
import { ImageUploader } from './ImageUploader'

import type { Aspect } from './types'

interface Props {
  aspect?: Aspect
  initialImage?: string
  description?: string
  className?: string
  cropperClassName?: string
  onImageComplete?: (croppedImage: string) => void
  removeImage?: () => void
}

export const ImageCropper = ({
  aspect,
  initialImage,
  description,
  className,
  cropperClassName,
  onImageComplete,
  removeImage
}: Props) => {
  const [imgSrc, setImgSrc] = useState(initialImage ?? '')
  const [previewImage, setPreviewImage] = useState<string>(initialImage ?? '')
  const {
    isOpen: isOpenCropper,
    onOpen: onOpenCropper,
    onClose: onCloseCropper
  } = useDisclosure()
  const {
    isOpen: isOpenMosaic,
    onOpen: onOpenMosaic,
    onClose: onCloseMosaic
  } = useDisclosure()

  useEffect(() => {
    if (initialImage) {
      setPreviewImage(initialImage)
    }
  }, [initialImage])

  const handleCropComplete = (image: string) => {
    setImgSrc(image)
    setPreviewImage(image)
    onImageComplete?.(image)
  }

  const handleMosaicComplete = (mosaicImage: string) => {
    setImgSrc(mosaicImage)
    setPreviewImage(mosaicImage)
    onImageComplete?.(mosaicImage)
  }

  const handleRemoveImage = () => {
    setPreviewImage('')
    setImgSrc('')
    removeImage?.()
  }

  return (
    <div className={cn('gap-6 size-full', className)}>
      <ImageUploader
        onImageSelect={(dataUrl: string) => {
          setImgSrc(dataUrl)
          onOpenCropper()
        }}
      />

      {previewImage && (
        <Card className="w-full max-w-md mx-auto">
          <CardBody>
            <Image
              src={previewImage}
              alt="Cropped image"
              className="object-contain w-full h-auto"
            />

            <Button
              color="danger"
              variant="bordered"
              size="sm"
              className="absolute z-10 right-2 top-2"
              onPress={handleRemoveImage}
            >
              移除
            </Button>
          </CardBody>
        </Card>
      )}

      <ImageCropperModal
        isOpen={isOpenCropper}
        imgSrc={imgSrc}
        className={cropperClassName}
        initialAspect={aspect}
        description={description}
        onCropComplete={handleCropComplete}
        onOpenMosaic={onOpenMosaic}
        onClose={onCloseCropper}
      />

      <ImageMosaicModal
        isOpen={isOpenMosaic}
        imgSrc={imgSrc}
        onMosaicComplete={handleMosaicComplete}
        onClose={onCloseMosaic}
      />
    </div>
  )
}
