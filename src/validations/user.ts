import { z } from 'zod'

import { UsernameRegex, PasswordRegex } from '@/utils/validate'

export const getUserInfoSchema = z.object({
  uid: z.coerce.number().min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(20)
})

export const createFavoriteFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
})

export const updateFavoriteFolderSchema = z.object({
  folderId: z.coerce.number().min(1).max(9999999),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
})

export const getFavoriteFolderResourceSchema = z.object({
  folderId: z.coerce.number().min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100)
})

export const addToFavoriteSchema = z.object({
  dbId: z.coerce.string().min(1).max(9999999),
  folderId: z.coerce
    .number({ message: '收藏文件夹 ID 必须为数字' })
    .min(1)
    .max(9999999)
})

export const avatarSchema = z.object({
  avatar: z.any()
})

export const bioSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(1, { message: '您的签名最少需要 1 个字符' })
    .max(107, { message: '签名不能超过 107 个字符' })
})

export const usernameSchema = z.object({
  username: z.string().trim().regex(UsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  })
})

export const passwordSchema = z.object({
  oldPassword: z.string().trim().regex(PasswordRegex, {
    message:
      '旧密码格式非法, 密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  }),
  newPassword: z.string().trim().regex(PasswordRegex, {
    message:
      '新密码格式非法, 密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  })
})
