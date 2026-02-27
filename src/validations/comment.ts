import { z } from 'zod'

export const resourceCommentUpdateSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论的内容最少为 1 个字符' })
    .max(10007, { message: '评论的内容最多为 10007 个字符' })
})

export const resourceCommentCreateSchema = z.object({
  id: z.coerce.string().min(7).max(7),
  parentId: z.coerce.number().min(1).max(9999999).optional().nullable(),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论的内容最少为 1 个字符' })
    .max(10007, { message: '评论的内容最多为 10007 个字符' })
})

export const createResourceCommentReportSchema = z.object({
  commentId: z.coerce
    .number({ message: '评论 ID 必须为数字' })
    .min(1)
    .max(9999999),
  resourceId: z.coerce
    .number({ message: '游戏 ID 必须为数字' })
    .min(1)
    .max(9999999),
  content: z
    .string({ message: '举报原因为必填字段' })
    .min(2, { message: '举报原因最少 2 个字符' })
    .max(5000, { message: '举报原因最多 5000 个字符' })
})
