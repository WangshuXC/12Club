import { z } from 'zod'

import {
  SUPPORTED_LANGUAGE,
  SUPPORTED_TYPE,
  SUPPORTED_RESOURCE_LINK,
  SUPPORTED_RESOURCE_SECTION
} from '@/constants/resource'
import { ResourceSizeRegex } from '@/utils/validate'

export const patchResourceCreateSchema = z.object({
  dbId: z.coerce.string().min(1).max(9999999),
  section: z
    .string()
    .refine((type) => SUPPORTED_RESOURCE_SECTION.includes(type), {
      message: '资源链接类型仅能为 12club 或 个人'
    }),
  name: z.string().max(300, { message: '资源名称最多 300 个字符' }),
  storage: z.string().refine((type) => SUPPORTED_RESOURCE_LINK.includes(type), {
    message: '非法的资源链接类型'
  }),
  hash: z.string().max(107),
  content: z
    .string()
    .min(1)
    .max(1007, { message: '您的资源链接内容最多 1007 个字符' }),
  size: z
    .string()
    .regex(ResourceSizeRegex, { message: '请选择资源的大小, MB 或 GB' }),
  code: z.string().trim().max(1007, { message: '资源提取码长度最多 1007 位' }),
  password: z.string().max(1007, { message: '资源解压码长度最多 1007 位' }),
  note: z.string().max(10007, { message: '资源备注最多 10007 字' }),
  language: z
    .array(z.string())
    .min(1, { message: '请选择至少一个资源地区' })
    .max(10, { message: '您的单个资源最多有 10 个语言' })
    .refine(
      (types) => types.every((type) => SUPPORTED_LANGUAGE.includes(type)),
      { message: '非法的语言' }
    )
})

export const updatePatchResourceStatsSchema = z.object({
  patchId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999),
  resourceId: z.coerce.number({ message: 'ID 必须为数字' }).min(1).max(9999999)
})

export const patchResourceUpdateSchema = patchResourceCreateSchema.merge(
  z.object({
    patchId: z.coerce.number().min(1).max(9999999)
  })
)

export const patchCommentUpdateSchema = z.object({
  commentId: z.coerce.number().min(1).max(9999999),
  content: z
    .string()
    .trim()
    .min(1, { message: '评论的内容最少为 1 个字符' })
    .max(10007, { message: '评论的内容最多为 10007 个字符' })
})