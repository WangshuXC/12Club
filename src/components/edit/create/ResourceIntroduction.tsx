'use client'
import { Textarea } from '@heroui/react'

import { useCreateResourceStore } from '@/store/editStore'

interface Props {
  errors: string | undefined
}

export const ResourceIntroduction = ({ errors }: Props) => {
  const { data, setData } = useCreateResourceStore()

  return (
    <div className="space-y-2">
      <h2 className="text-xl">资源介绍 (必选)</h2>
      <Textarea
        placeholder="输入资源的简介，这会展示在资源详情页中"
        value={data.introduction}
        onChange={(e) => setData({ ...data, introduction: e.target.value })}
      />
      {errors && <p className="text-xs text-danger-500">{errors}</p>}

      <p className="text-small text-default-500">
        字数: {data.introduction.length}
      </p>
    </div>
  )
}
