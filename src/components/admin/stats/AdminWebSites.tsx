'use client'

import { FC } from 'react'

import { Card, CardBody, CardFooter, Link, Tooltip } from '@heroui/react'
import { Globe } from 'lucide-react'

import { ADMIN_WEBSITES_DATA } from '@/constants/admin'

interface WebSiteInfo {
  name: string
  url: string
  description: string
}

const WebSiteCard: FC<{ website: WebSiteInfo }> = ({ website }) => {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-default-700 flex items-center gap-2">
            {website.name}
          </h4>
        </div>

        <p className="text-sm text-default-500">{website.description}</p>
      </CardBody>
      <CardFooter>
        <Link
          isExternal
          showAnchorIcon
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          访问站点
        </Link>
      </CardFooter>
    </Card>
  )
}

export const AdminWebSites: FC = () => {
  return (
    <div className="flex flex-col space-y-6">
      <h3 className="text-2xl font-bold whitespace-nowrap flex items-center gap-2">
        <Globe size={20} className="hidden 2xl:block" />
        额外站点
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 4xl:grid-cols-4 gap-4">
        {ADMIN_WEBSITES_DATA.map((website) => (
          <WebSiteCard key={website.url} website={website} />
        ))}
      </div>
    </div>
  )
}
