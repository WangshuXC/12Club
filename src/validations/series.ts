import { z } from 'zod'

// 系列基础验证模式
export const seriesBaseSchema = z.object({
  name: z.string().trim().min(1, { message: '系列名称不能为空' }).max(255, { message: '系列名称不能超过 255 个字符' }),
  description: z.string().trim().max(1000, { message: '系列描述不能超过 1000 个字符' }).optional()
})

// 系列创建验证模式
export const createSeriesSchema = seriesBaseSchema.extend({
  resourceIds: z.array(z.coerce.number().min(1)).min(1, { message: '至少需要选择一个资源' })
})

// 系列更新验证模式
export const updateSeriesSchema = seriesBaseSchema.extend({
  id: z.coerce.number().min(1).max(9999999)
})

// 系列查询验证模式
export const getSeriesSchema = z.object({
  page: z.coerce.number().min(1).max(9999999).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(300, { message: '搜索内容最多 300 个字符' }).optional(),
  sortField: z.enum(['created', 'updated', 'name', 'resource_count']).default('updated'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// 系列删除验证模式
export const deleteSeriesSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})

// 系列资源关联验证模式
export const seriesResourceSchema = z.object({
  seriesId: z.coerce.number().min(1).max(9999999),
  resourceIds: z.array(z.coerce.number().min(1)).min(1, { message: '至少需要选择一个资源' })
})

// 单个资源ID验证模式
export const resourceIdSchema = z.object({
  resourceId: z.coerce.number().min(1).max(9999999)
})

// 系列ID验证模式
export const seriesIdSchema = z.object({
  seriesId: z.coerce.number().min(1).max(9999999)
})