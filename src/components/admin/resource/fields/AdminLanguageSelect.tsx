'use client'

import { Select, SelectItem } from '@heroui/react'
import { Languages } from 'lucide-react'

import {
  SUPPORTED_LANGUAGE,
  SUPPORTED_LANGUAGE_MAP
} from '@/constants/resource'

interface Props {
  language: string
  onChange: (language: string) => void
  errors?: string
}

export const AdminLanguageSelect = ({ language, onChange, errors }: Props) => {
  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium">资源地区</label>
      <Select
        placeholder="选择地区"
        selectedKeys={[language]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string
          if (selected) {
            onChange(selected)
          }
        }}
        startContent={<Languages className="size-4 text-default-400" />}
        radius="lg"
        size="md"
        isInvalid={!!errors}
        errorMessage={errors}
      >
        {SUPPORTED_LANGUAGE.map((lang) => (
          <SelectItem key={lang} className="text-default-700">
            {SUPPORTED_LANGUAGE_MAP[lang]}
          </SelectItem>
        ))}
      </Select>
      <p className="text-sm text-default-500">
        选择资源出版社所在地区，目前支持中文，日本語，英语和其他
      </p>
    </div>
  )
}
