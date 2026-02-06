'use client'

import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { addToast, Button } from '@heroui/react'
import localforage from 'localforage'
import { useRouter } from 'next-nprogress-bar'

import { useCreateResourceStore } from '@/store/editStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchFormData } from '@/utils/fetch'
import { resourceCreateSchema } from '@/validations/edit'

import type { CreateResourceRequestData } from '@/store/editStore'

interface Props {
  setErrors: Dispatch<
    SetStateAction<Partial<Record<keyof CreateResourceRequestData, string>>>
  >
}

export const PublishButton = ({ setErrors }: Props) => {
  const router = useRouter()
  const { data, resetData } = useCreateResourceStore()

  const [creating, setCreating] = useState(false)
  const handleSubmit = async () => {
    const localeBannerBlob: Blob | null =
      await localforage.getItem('resource-banner')
    if (!localeBannerBlob) {
      addToast({
        title: '错误',
        description: '未检测到预览图片',
        color: 'danger'
      })
      return
    }

    const result = resourceCreateSchema.safeParse({
      ...data,
      banner: localeBannerBlob,
      alias: JSON.stringify(data.alias),
      tag: JSON.stringify(data.tag)
    })
    if (!result.success) {
      const newErrors: Partial<
        Record<keyof CreateResourceRequestData, string>
      > = {}
      result.error.errors.forEach((err) => {
        if (err.path.length) {
          newErrors[err.path[0] as keyof CreateResourceRequestData] =
            err.message
          addToast({
            title: '错误',
            description: err.message,
            color: 'danger'
          })
        }
      })
      setErrors(newErrors)
      return
    } else {
      setErrors({})
    }

    const formDataToSend = new FormData()
    formDataToSend.append('banner', localeBannerBlob!)
    formDataToSend.append('name', data.name)
    formDataToSend.append('author', data.author)
    formDataToSend.append('translator', data.translator)
    formDataToSend.append('language', data.language)
    formDataToSend.append('accordionTotal', data.accordionTotal.toString())
    formDataToSend.append('dbId', data.dbId)
    formDataToSend.append('introduction', data.introduction)
    formDataToSend.append('alias', JSON.stringify(data.alias))
    formDataToSend.append('tag', JSON.stringify(data.tag))
    formDataToSend.append('released', data.released)

    setCreating(true)
    addToast({
      title: '提示',
      description: '正在发布中 ... 这可能需要 10s 左右的时间, 这取决于您的网络环境',
      color: 'default'
    })

    const res = await FetchFormData<{
      dbId: string
    }>('/edit', formDataToSend)
    ErrorHandler(res, async (value) => {
      resetData()
      await localforage.removeItem('resource-banner')
      router.push(`/admin/resource?query=${value.dbId}`)
    })
    addToast({
      title: '成功',
      description: '发布完成, 正在为您跳转到资源介绍页面',
      color: 'success'
    })
    setCreating(false)
  }

  return (
    <Button
      color="primary"
      onPress={handleSubmit}
      className="w-full mt-4"
      isDisabled={creating}
      isLoading={creating}
    >
      提交
    </Button>
  )
}
