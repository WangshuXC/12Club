'use server'

import { cache } from 'react'

import { z } from 'zod'

import {
  Introduction,
  Cover,
} from '@/types/common/detail-container'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { FetchGet } from '@/utils/fetch'

const idSchema = z.object({
  id: z.string().min(7).max(7)
})

// 系列资源类型
interface SeriesResource {
  dbId: string
  name: string
  image: string
  released: string | null
}

// 系列信息类型
interface SeriesInfo {
  id: number
  name: string
  description: string
  resources: SeriesResource[]
}

const _getResourceActions = async (params: z.infer<typeof idSchema>) => {
  const input = safeParseSchema(idSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()
  
  const response = await FetchGet<{
    introduce: Introduction
    coverData: Cover
    series: SeriesInfo[] | null
  }>('/detail', {
    id: params.id,
    uid: payload?.uid ?? 0
  })

  if (typeof response === 'string') return response

  const { introduce, coverData, series } = response

  return { introduce, coverData, series }
}

// 使用 React cache 缓存函数调用结果
export const getResourceActions = cache(_getResourceActions)
