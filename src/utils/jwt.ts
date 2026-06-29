import jwt from 'jsonwebtoken'

import { delKv, getKv, setKv } from '@/lib/redis'

export interface Payload {
  iss: string
  aud: string
  uid: number
  name: string
  role: number
}

export const generateToken = async (
  uid: number,
  name: string,
  role: number,
  expire: string
) => {
  const payload: Payload = {
    iss: process.env.JWT_ISS!,
    aud: process.env.JWT_AUD!,
    uid,
    name,
    role
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: expire
  } as jwt.SignOptions)
  await setKv(`access:token:${payload.uid}`, token, 30 * 24 * 60 * 60)

  return token
}

export const verifyToken = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as Payload
    const redisToken = await getKv(`access:token:${payload.uid}`)

    if (!redisToken) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const deleteToken = async (uid: number) => {
  await delKv(`access:token:${uid}`)
}

// 仅用于前端埋点 uin 透传，不参与鉴权，故只 decode 不 verify
export const decodeTokenUid = (token: string): number | null => {
  try {
    const payload = jwt.decode(token) as Payload | null

    return payload && typeof payload.uid === 'number' ? payload.uid : null
  } catch {
    return null
  }
}
