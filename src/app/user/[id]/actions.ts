'use server'

import { z } from 'zod'

import { getUserProfile } from '@/app/api/user/status/info/route'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

const getProfileSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})

export const getActions = async (id: number) => {
  const input = safeParseSchema(getProfileSchema, { id })
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()

  const user = await getUserProfile(input, payload?.uid ?? 0)

  return user
}
