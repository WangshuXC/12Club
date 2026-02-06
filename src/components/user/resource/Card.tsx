'use client'

import { Card, CardBody, Chip, Image } from '@heroui/react'
import Link from 'next/link'

import { ExternalLink } from '@/components/common/ExternalLink'
import { PatchAttribute } from '@/components/common/PatchAttribute'
import { formatDistanceToNow } from '@/utils/formatDistanceToNow'
import { getRouteByDbId } from '@/utils/router'

import type { UserResource as UserResourceType } from '@/types/api/user'

interface Props {
  resource: UserResourceType
}

export const UserResourceCard = ({ resource }: Props) => {
  return (
    <Card
      isPressable
      as={Link}
      href={getRouteByDbId(resource.patchUniqueId)}
      className="w-full"
    >
      <CardBody className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:h-auto sm:w-40">
            <Image
              src={resource.patchBanner}
              alt={resource.patchName}
              className="object-cover rounded-lg size-full max-h-52"
              radius="lg"
            />
          </div>
          <div className="flex w-full flex-col justify-between space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h2 className="text-lg font-semibold transition-colors line-clamp-2 hover:text-primary-500">
                  {resource.patchName}
                </h2>
                <Chip variant="flat">
                  {formatDistanceToNow(resource.created)}
                </Chip>
              </div>

              <PatchAttribute
                types={resource.type}
                languages={resource.language}
                size={resource.size}
                attributeSize="sm"
              />
            </div>

            <div>
              {resource.content.split(',').map((link) => (
                <div
                  key={link}
                  className="underline text-sky-400"
                  onClick={() => window.open(link)}
                >
                  {link}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
