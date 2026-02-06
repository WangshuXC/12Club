'use server'

import { z } from 'zod'

import { getResetCodes } from '@/app/api/auth/forgot/get'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { adminPaginationSchema } from '@/validations/admin'

export const getActions = async (
  params: z.infer<typeof adminPaginationSchema>
) => {
  const input = safeParseSchema(adminPaginationSchema, params)
  if (typeof input === 'string') {
    return input
  }

  const response = await getResetCodes(input)

  return response
}
