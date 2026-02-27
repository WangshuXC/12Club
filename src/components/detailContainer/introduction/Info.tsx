import { Chip, Tooltip } from '@heroui/react'
import { Calendar, Clock, Link, RefreshCw } from 'lucide-react'

import { formatDate } from '@/utils/time'

import type { Introduction } from '@/types/common/detail-container'

interface Props {
  intro: Introduction
  type: string
}

export const Info = ({ intro, type }: Props) => {
  return (
    <>
      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-default-500">
          <Clock className="size-4" />
          <span>
            发布时间: {formatDate(intro.created, { isShowYear: true })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-default-500">
          <RefreshCw className="size-4" />
          <span>
            更新时间: {formatDate(intro.updated, { isShowYear: true })}
          </span>
        </div>
        {intro.released && (
          <div className="flex items-center gap-2 text-sm text-default-500">
            <Calendar className="size-4" />
            <span>发行时间: {intro.released}</span>
          </div>
        )}
        {intro.dbId && (
          <div className="flex items-center gap-2 text-sm text-default-500">
            <Link className="size-4" />
            <span>DB ID: {intro.dbId}</span>
          </div>
        )}
      </div>

      {intro.tags.length > 0 && (
        <>
          <h2 className="pt-8 mt-12 text-2xl border-t border-default-200">
            {type}标签
          </h2>
          {intro.tags.map((tag) => (
            <Tooltip key={tag.name} content={`${tag.count} 个 资源 使用此标签`}>
              <Chip color="secondary" variant="flat">
                {tag.name}
                {` +${tag.count}`}
              </Chip>
            </Tooltip>
          ))}
        </>
      )}

      {intro.alias.length > 0 && (
        <>
          <h2 className="pt-8 mt-12 text-2xl border-t border-default-200">
            {type}别名
          </h2>
          <ul className="text-sm list-disc list-inside text-default-500">
            {intro.alias.map((alias) => (
              <li key={Math.random()}>{alias}</li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
