'use server'

import { cookies } from 'next/headers'

import { verifyToken } from '@/utils/jwt'

export const verifyHeaderCookie = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('12club-token')
  
  if (!token?.value) {
    console.log('[verifyHeaderCookie] Token not found in cookies')
    return null
  }
  
  const payload = await verifyToken(token.value)
  
  if (!payload) {
    console.log('[verifyHeaderCookie] Token verification failed')
  }

  return payload
}
