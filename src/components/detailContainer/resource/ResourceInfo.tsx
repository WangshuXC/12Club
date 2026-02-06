'use client'

import { Snippet } from '@heroui/react'

import { cn } from '@/lib/utils'

import type { PatchResource } from '@/types/api/patch'

interface Props {
  resource: PatchResource
}

export const ResourceInfo = ({ resource }: Props) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Snippet
          tooltipProps={{
            content: resource.code ? '点击复制提取码' : '无提取码'
          }}
          hideCopyButton={resource.code ? false : true}
          size="sm"
          symbol={resource.code ? '提取码' : '无提取码'}
          color="primary"
          className={cn(resource.code ? 'py-0' : 'h-8')}
        >
          {resource.code}
        </Snippet>

        <Snippet
          tooltipProps={{
            content: resource.password ? '点击复制解压码' : '无解压码'
          }}
          hideCopyButton={resource.password ? false : true}
          size="sm"
          symbol={resource.code ? '解压码' : '无解压码'}
          color="primary"
          className={cn(resource.password ? 'py-0' : 'h-8')}
        >
          {resource.password}
        </Snippet>
      </div>
    </div>
  )
}
