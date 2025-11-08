import { z } from 'zod'
import { UsernameRegex, PasswordRegex } from '@/utils/validate'

export const loginSchema = z.object({
  name: z
    .string()
    .trim()
    .email({ message: '请输入合法的邮箱格式, 用户名则应为 1~17 位任意字符' })
    .or(
      z.string().trim().regex(UsernameRegex, {
        message: '非法的用户名，用户名为 1~17 位任意字符'
      })
    ),
  password: z.string().trim().regex(PasswordRegex, {
    message:
      '非法的密码格式，密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  })
})

// 申请重置密码的验证模式
export const forgotRequestSchema = z.object({
  name: z.string().trim().regex(UsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z.string().email({ message: '请输入合法的邮箱格式' })
})

// 重置密码的验证模式
export const forgotResetSchema = z.object({
  name: z.string().regex(UsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z.string().email({ message: '请输入合法的邮箱格式' }),
  resetCode: z.string().uuid({ message: '非法的重置码格式' }),
  password: z.string().trim().regex(PasswordRegex, {
    message:
      '非法的密码格式，密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  })
})

// 保持向后兼容
export const forgotSchema = forgotRequestSchema

export const updateResetCodeStatusSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})

const baseRegisterSchema = z.object({
  name: z.string().regex(UsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z
    .string()
    .email({ message: '请输入合法的邮箱格式' })
    .or(
      z.string().regex(UsernameRegex, {
        message: '非法的用户名，用户名为 1~17 位任意字符'
      })
    ),
  password: z.string().trim().regex(PasswordRegex, {
    message:
      '非法的密码格式，密码的长度为 6 到 1007 位，必须包含至少一个英文字符和一个数字，可以选择性的包含 @!#$%^&*()_-+=\\/ 等特殊字符'
  }),
  confirmPassword: z.string().trim()
})

export const registerSchema = baseRegisterSchema.refine((data) => data.password === data.confirmPassword, {
  message: '密码和确认密码不一致',
  path: ['confirmPassword']
})

export const backendRegisterSchema = baseRegisterSchema.extend({
  password: z
    .string()
    .regex(/^[0-9a-f]{32}:[0-9a-f]{64}$/, { message: '密码哈希格式非法' })
}).omit({ confirmPassword: true })

export const sendRegisterEmailVerificationCodeSchema = z.object({
  name: z.string().regex(UsernameRegex, {
    message: '非法的用户名，用户名为 1~17 位任意字符'
  }),
  email: z
    .string()
    .email({ message: '请输入合法的邮箱格式' })
    .or(
      z.string().regex(UsernameRegex, {
        message: '非法的用户名，用户名为 1~17 位任意字符'
      })
    )
})

export const disableEmailNoticeSchema = z.object({
  email: z.string().email({ message: '非法的邮箱格式' }),
  validateEmailCode: z.string().uuid({ message: '非法的邮箱验证码格式' })
})
