'use client'

import { useEffect } from 'react'

import { addToast, Button, Chip, Input } from '@heroui/react'
import { Plus, X } from 'lucide-react'

import { SUPPORTED_RESOURCE_LINK_MAP } from '@/constants/resource'

import { ErrorType } from '../share'

import { fetchLinkData, fetchListData } from './fetchAlistSize'

interface ResourceLinksInputProps {
  errors: ErrorType
  storage: string
  content: string
  size: string
  setContent: (value: string) => void
  setSize: (value: string) => void
}

export const ResourceLinksInput = ({
  errors,
  storage,
  content,
  size,
  setContent,
  setSize
}: ResourceLinksInputProps) => {
  const links = content.trim() ? content.trim().split(',') : ['']

  const checkLinkSize = async (link: string) => {
    addToast({
      title: '提示',
      description: '正在尝试从 TouchGal Alist 获取文件大小',
      color: 'default'
    })
    const data = await fetchLinkData(link)
    if (data && data.code === 0) {
      let sizeInGB
      if (data.data.source.size > 0) {
        sizeInGB = (data.data.source.size / 1024 ** 3).toFixed(3)
      } else {
        const listSize = await fetchListData(data.data.key)
        sizeInGB = listSize ? (listSize / 1024 ** 3).toFixed(3) : ''
      }

      addToast({
        title: '成功',
        description: '获取文件大小成功',
        color: 'success'
      })
      setSize(`${sizeInGB} GB`)
    }
  }

  useEffect(() => {
    if (!links.length || size) {
      return
    }

    if (links.some((link) => link.includes('pan.touchgal.net/s/'))) {
      checkLinkSize(links[0])
    }
  }, [links, setSize])

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">资源链接</h3>
      <p className="text-sm text-default-500">
        {'请自行添加资源链接。为保证单一性, 建议您一次添加一条资源链接'}
      </p>

      {links.map((link, index) => (
        <div key={index} className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            {
              SUPPORTED_RESOURCE_LINK_MAP[
              storage as keyof typeof SUPPORTED_RESOURCE_LINK_MAP
              ]
            }
          </Chip>

          <div className="flex-col w-full">
            <Input
              isRequired
              placeholder={'请输入资源链接'}
              value={link}
              isInvalid={!!errors.content}
              errorMessage={errors.content?.message}
              onChange={(e) => {
                e.preventDefault()
                const newLinks = [...links]
                newLinks[index] = e.target.value
                setContent(newLinks.filter(Boolean).toString())
              }}
            />
          </div>

          <div className="flex justify-end">
            {index === links.length - 1 ? (
              <Button
                isIconOnly
                variant="flat"
                onPress={() => setContent([...links, ''].toString())}
              >
                <Plus className="size-4" />
              </Button>
            ) : (
              <Button
                isIconOnly
                variant="flat"
                color="danger"
                onPress={() => {
                  const newLinks = links.filter((_, i) => i !== index)
                  setContent(newLinks.toString())
                }}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
