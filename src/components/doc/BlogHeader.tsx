'use client'

import { Card, CardBody, CardHeader, Image } from '@heroui/react'
import { CalendarDays } from 'lucide-react'

import { formatDate } from '@/utils/time'

import type { Frontmatter } from '@/lib/mdx/types'

interface BlogHeaderProps {
  frontmatter: Frontmatter
}

export const BlogHeader = ({ frontmatter }: BlogHeaderProps) => {
  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="flex flex-col items-start px-0 pb-0">
        <div className="relative w-full max-h-80 overflow-hidden rounded-xl">
          <Image
            isZoomed
            alt={frontmatter.title}
            className="object-cover object-center"
            src={frontmatter.banner}
            width="100%"
            height="100%"
          />
        </div>
      </CardHeader>

      <CardBody>
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {frontmatter.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="font-semibold leading-none text-small">
                {frontmatter.authorName}
              </h2>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-default-400" />
                <p className="text-small text-default-400">
                  {formatDate(frontmatter.date, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
