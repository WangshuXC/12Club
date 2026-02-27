'use server'

import { z } from 'zod'

import { getAutoUpdateResources } from '@/app/api/admin/auto-update/get'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { adminPaginationSchema } from '@/validations/admin'

export const GetAutoUpdateActions = async (
  params: z.infer<typeof adminPaginationSchema>
) => {
  const input = safeParseSchema(adminPaginationSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登陆失效'
  }

  if (payload.role < 3) {
    return '本页面仅管理员可访问'
  }

  const response = await getAutoUpdateResources(input)

  return response
}
