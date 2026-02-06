'use client'

import { Button, Tooltip } from '@heroui/react'
import { Share2 } from 'lucide-react'

import { Config } from '@/config/config'
import { Copy } from '@/utils/copy'

interface Props {
  name: string
  pathName: string
}

export const ShareButton = ({ name, pathName }: Props) => {
  const handleCopyShareLink = () => {
    const text = `${name} - ${Config.url}${pathName}`
    Copy(text)
  }

  return (
    <Tooltip content="复制分享链接">
      <Button
        variant="bordered"
        aria-label="复制分享链接"
        isIconOnly
        onPress={handleCopyShareLink}
      >
        <Share2 className="size-4" />
      </Button>
    </Tooltip>
  )
}
