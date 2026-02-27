'use client'

import { useState } from 'react'

import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  addToast
} from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { patchResourceCreateSchema } from '@/validations/patch'

import { ResourceDetailsForm } from './ResourceDetailsForm'
import { ResourceLinksInput } from './ResourceLinksInput'
import { ResourceSectionSelect } from './ResourceSectionSelect'
import { ResourceTypeSelect } from './ResourceTypeSelect'

// import { FileUploadContainer } from '../upload/FileUploadContainer'

import type { PatchResource } from '@/types/api/patch'

export type ResourceFormData = z.infer<typeof patchResourceCreateSchema>

interface CreateResourceProps {
  dbId: string
  onClose: () => void
  onSuccess?: (res: PatchResource) => void
}

const userRoleStorageMap: Record<number, string> = {
  1: 'user',
  2: 'user',
  3: 'alist',
  4: 'alist'
}

export const PublishResource = ({
  dbId,
  onClose,
  onSuccess
}: CreateResourceProps) => {
  const [creating, setCreating] = useState(false)
  const user = useUserStore((state) => state.user)

  const {
    control,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm<ResourceFormData>({
    resolver: zodResolver(patchResourceCreateSchema),
    defaultValues: {
      dbId,
      storage: userRoleStorageMap[user.role],
      name: '',
      section: user.role > 2 ? 'club' : 'individual',
      hash: '',
      content: '',
      code: '',
      language: [],
      size: '',
      password: '',
      note: ''
    }
  })

  const handleCreateResource = async () => {
    setCreating(true)
    const res = await FetchPost<PatchResource>('/patch', watch())
    setCreating(false)
    ErrorHandler(res, (value) => {
      reset()
      onSuccess?.(value)
      addToast({
        title: '成功',
        description: '资源发布成功',
        color: 'success'
      })
    })
  }

  return (
    <ModalContent>
      <ModalBody>
        <form className="space-y-6">
          <ResourceSectionSelect
            errors={errors}
            section={watch().section}
            userRole={user.role}
            setSection={(content) => {
              setValue('section', content)
              setValue('storage', userRoleStorageMap[user.role])
            }}
          />

          <ResourceTypeSelect
            section={watch().section}
            control={control}
            errors={errors}
          />

          {(watch().storage !== 's3' || watch().content) && (
            <ResourceLinksInput
              errors={errors}
              storage={watch().storage}
              content={watch().content}
              size={watch().size}
              setContent={(content) => setValue('content', content)}
              setSize={(size) => setValue('size', size)}
            />
          )}

          <ResourceDetailsForm control={control} errors={errors} />
        </form>
      </ModalBody>

      <ModalFooter className="flex-col items-end">
        <div className="space-x-2">
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            disabled={creating}
            isLoading={creating}
            endContent={<Upload className="size-4" />}
            onPress={handleCreateResource}
          >
            发布资源
          </Button>
        </div>

        {creating && (
          <>
            <p>
              我们正在将您的补丁从服务器同步到云端, 请稍后 ...
              取决于您的网络环境, 这也许需要一段时间
            </p>
          </>
        )}
      </ModalFooter>
    </ModalContent>
  )
}
