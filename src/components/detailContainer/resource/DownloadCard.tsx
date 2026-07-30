'use client'

import type { JSX } from 'react'

import { Chip } from '@heroui/react'
import { Cloud, Link as LinkIcon, Database } from 'lucide-react'

import { ExternalLink } from '@/components/common/ExternalLink'
import { useTrackingContext } from '@/components/tracking/TrackingProvider'
import { SUPPORTED_RESOURCE_LINK_MAP } from '@/constants/resource'
import { FetchPut } from '@/utils/fetch'

import type { PatchResource } from '@/types/api/patch'

const storageIcons: { [key: string]: JSX.Element } = {
  alist: <Cloud className="size-4" />,
  user: <LinkIcon className="size-4" />
}

interface Props {
  resource: PatchResource
}

export const ResourceDownloadCard = ({ resource }: Props) => {
  const { trackCustom } = useTrackingContext()
  const handleClickDownload = async (linkIndex: number) => {
    await FetchPut<object>('/patch/download', {
      resourceId: resource.resourceId,
      patchId: resource.id
    })
    trackCustom('download_link_click', {
      dbid: resource.dbId,
      patch_id: resource.id,
      storage: resource.storage,
      link_index: linkIndex
    })
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <Chip
          color="secondary"
          variant="flat"
          startContent={storageIcons[resource.storage]}
        >
          {SUPPORTED_RESOURCE_LINK_MAP[resource.storage as 'alist' | 'user']}
        </Chip>
        <Chip variant="flat" startContent={<Database className="w-4 h-4" />}>
          {resource.size}
        </Chip>
      </div>

      <p className="text-sm text-default-500">点击下面的链接以下载</p>

      {resource.content.split(',').map((link, index) => (
        <div key={`${resource.id}-${index}`} className="space-y-2">
          <ExternalLink
            onPress={() => handleClickDownload(index)}
            underline="always"
            link={link}
          >
            {link}
          </ExternalLink>
        </div>
      ))}
    </div>
  )
}
