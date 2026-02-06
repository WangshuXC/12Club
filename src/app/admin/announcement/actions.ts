'use server'

import { z } from 'zod'

import { FetchGet } from '@/utils/fetch'
import { adminPaginationSchema } from '@/validations/admin'

export const getActions = async (input: z.infer<typeof adminPaginationSchema>) => {
  try {
    const queryParams: Record<string, string | number> = {
      page: input.page,
      limit: input.limit
    }
    
    if (input.search) {
      queryParams.search = input.search
    }

    const data = await FetchGet<{
      data: any[]
      pagination: {
        total: number
      }
    }>('/admin/announcement', queryParams)

    return {
      announcements: data.data,
      total: data.pagination.total
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    return '获取公告列表失败'
  }
} 