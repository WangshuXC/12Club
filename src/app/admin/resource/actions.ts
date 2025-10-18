'use server'

import { z } from 'zod'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { adminGetResourceSchema } from '@/validations/admin'
import { getResource } from '@/app/api/admin/resource/get'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

export const GetActions = async (
  params: z.infer<typeof adminGetResourceSchema>
) => {
  const input = safeParseSchema(adminGetResourceSchema, params)
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

  const response = await getResource(input)
  return response
}
