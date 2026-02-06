import { z } from 'zod'

import { getSeries } from '@/app/api/admin/series/get'
import { adminGetSeriesSchema } from '@/validations/admin'

import type { AdminSeriesListResponse } from '@/types/api/admin'

export const GetSeriesActions = async (
  input: z.infer<typeof adminGetSeriesSchema>
): Promise<AdminSeriesListResponse | string> => {
  try {
    const result = await getSeries(input)
    
    if (typeof result === 'string') {
      return result
    }
    
    return result
  } catch (error) {
    console.error('获取系列列表失败:', error)
    return error instanceof Error ? error.message : '获取系列列表时发生未知错误'
  }
}