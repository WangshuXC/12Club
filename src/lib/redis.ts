import Redis from 'ioredis'

const REDIS_PREFIX = '12club:nextjs'

export const redis = new Redis({
  port: parseInt(process.env.REDIS_PORT!),
  host: process.env.REDIS_HOST
})

export const setKv = async (key: string, value: string, time?: number) => {
  const keyString = `${REDIS_PREFIX}:${key}`
  if (time) {
    await redis.setex(keyString, time, value)
  } else {
    await redis.set(keyString, value)
  }
}

export const getKv = async (key: string) => {
  const keyString = `${REDIS_PREFIX}:${key}`
  const value = await redis.get(keyString)
  return value
}

export const delKv = async (key: string) => {
  const keyString = `${REDIS_PREFIX}:${key}`
  await redis.del(keyString)
}
