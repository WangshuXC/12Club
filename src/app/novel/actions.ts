'use server'

import { z } from 'zod'

import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { FetchGet } from '@/utils/fetch'
import { pageSchema } from '@/validations/page'

import type { PageData } from '@/types/api/page'

export const getPageResourceActions = async (
  params: z.infer<typeof pageSchema>
) => {
  const input = safeParseSchema(pageSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await FetchGet<{
    _data: PageData[]
    total: number
  }>('/page', input)

  if (typeof response === 'string') return response

  const { _data, total } = response

  return { _data, total }
}
