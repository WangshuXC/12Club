import { z } from 'zod'

export const createResourceFeedbackSchema = z.object({
  dbId: z.coerce.string({ message: 'ID 必须为字符串' }).min(1).max(9999999),
  content: z
    .string({ message: '反馈内容为必填字段' })
    .min(10, { message: '反馈信息最少 10 个字符' })
    .max(5000, { message: '反馈信息最多 5000 个字符' })
})
