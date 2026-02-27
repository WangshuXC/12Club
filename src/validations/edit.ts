import { z } from 'zod'

export const resourceCreateSchema = z.object({
  banner: z.any(),
  name: z.string().trim().min(1, { message: '资源名称是必填项' }),
  author: z.string().trim().min(1, { message: '资源作者是必填项' }),
  translator: z.string().trim().optional(),
  language: z.string().trim().min(1, { message: '资源地区是必填项' }),
  accordionTotal: z
    .union([
      z.number().min(0, { message: '总集数不能小于0' }),
      z
        .string()
        .regex(/^\d+$/, { message: '必须为纯数字字符串' })
        .transform(Number)
    ])
    .default(0),
  dbId: z.string().max(7),
  introduction: z
    .string()
    .trim()
    .min(10, { message: '资源介绍是必填项, 最少 10 个字符' })
    .max(100007, { message: '资源介绍最多 100007 字' }),
  alias: z
    .string()
    .max(3000, { message: '别名字符串总长度不可超过 3000 个字符' }),
  tag: z
    .string()
    .max(3000, { message: '标签字符串总长度不可超过 3000 个字符' })
    .optional(),
  released: z.string()
})
