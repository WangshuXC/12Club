import { z } from 'zod'

export const searchSchema = z.object({
  query: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(107, { message: '单个搜索关键词最大长度为 107' })
    )
    .min(1)
    .max(10, { message: '您最多使用 10 组关键词' }),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(24),
  searchOption: z.object({
    searchInIntroduction: z.boolean().default(false),
    searchInAlias: z.boolean().default(false),
    searchInTag: z.boolean().default(false),
    selectedResourceType: z.array(z.enum(['anime', 'comic', 'game', 'novel'])).default(['anime', 'comic', 'game', 'novel']),
    selectedType: z.string().default('all'),
    sortField: z.enum(['created', 'view', 'download', 'favorite_by', 'comment', 'updated', 'released']).default('updated'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    selectedLanguage: z.string().default('all'),
    selectedStatus: z.string().default('all')
  })
})
