import { z } from 'zod'

export const messageCategorySchema = z.enum(['notice', 'update', 'comment'])

export const CATEGORY_TYPE_MAP: Record<
  z.infer<typeof messageCategorySchema>,
  string[]
> = {
  notice: [
    'system',
    'pm',
    'apply',
    'feedback_handle',
    'report_handle',
    'pr',
    'mention'
  ],
  update: ['follow', 'favorite', 'resource_update'],
  comment: ['comment', 'like']
}

export const getMessageListSchema = z.object({
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100),
  category: messageCategorySchema
})

export const readMessageSchema = z.object({
  category: messageCategorySchema
})
