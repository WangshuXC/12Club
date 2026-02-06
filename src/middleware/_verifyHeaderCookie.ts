import { parseCookies } from '@/utils/cookies'
import { verifyToken } from '@/utils/jwt'

import type { NextRequest } from 'next/server'

export const verifyHeaderCookie = async (req: NextRequest) => {
  const token = parseCookies(req.headers.get('cookie') ?? '')['12club-token']
  const payload = await verifyToken(token ?? '')

  return payload
}
