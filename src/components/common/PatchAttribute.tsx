'use client'

import { Chip } from '@heroui/react'

import {
  SUPPORTED_LANGUAGE_MAP,
  SUPPORTED_TYPE_MAP
} from '@/constants/resource'

interface Props {
  types: string[]
  languages?: string[]
  size?: string
  attributeSize?: 'lg' | 'md' | 'sm'
}

export const PatchAttribute = ({
  types,
  languages = [],
  size = '',
  attributeSize = 'md'
}: Props) => {
  return (
    <div className="flex flex-wrap justify-start gap-2">
      {types.map((type) => (
        <Chip key={type} variant="flat" color="primary" size={attributeSize}>
          {SUPPORTED_TYPE_MAP[type]}
        </Chip>
      ))}
      {languages?.map((lang) => (
        <Chip key={lang} variant="flat" color="secondary" size={attributeSize}>
          {SUPPORTED_LANGUAGE_MAP[lang]}
        </Chip>
      ))}
      {size && (
        <Chip variant="flat" color="primary" size={attributeSize}>
          {size}
        </Chip>
      )}
    </div>
  )
}
