'use client'

import { Select, SelectItem } from '@heroui/react'
import { Languages } from 'lucide-react'

import {
  SUPPORTED_LANGUAGE,
  SUPPORTED_LANGUAGE_MAP
} from '@/constants/resource'
import { useCreateResourceStore } from '@/store/editStore'

interface Props {
  errors: string | undefined
}

export const LanguageSelect = ({ errors }: Props) => {
  const { data, setData } = useCreateResourceStore()

  return (
    <div className="w-full space-y-2">
      <h2 className="text-xl">资源地区</h2>
      <Select
        placeholder="选择地区"
        selectedKeys={[data.language]}
        onChange={(event) => {
          if (!event.target.value) {
            return
          }

          setData({ ...data, language: event.target.value })
        }}
        startContent={<Languages className="size-4 text-default-400" />}
        radius="lg"
        size="md"
      >
        {SUPPORTED_LANGUAGE.map((language) => (
          <SelectItem key={language} className="text-default-700">
            {SUPPORTED_LANGUAGE_MAP[language]}
          </SelectItem>
        ))}
      </Select>
      <p className="text-sm text-default-500">
        选择资源出版社所在地区，目前支持中文，日本語，英语和其他
      </p>
    </div>
  )
}
