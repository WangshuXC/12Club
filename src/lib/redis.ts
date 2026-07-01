import Redis from 'ioredis'

export const REDIS_PREFIX = '12club:nextjs'

// 声明全局变量，避免 dev 模式 HMR 重复实例化
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const createRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    // 关键健壮性配置
    lazyConnect: false,
    maxRetriesPerRequest: 3, // 单请求最多重试 3 次，避免雪崩
    enableOfflineQueue: false, // Redis 断开时立即失败，不无限排队
    connectTimeout: 5000,
    retryStrategy: (times) => {
      // 指数退避，最长 10s
      return Math.min(times * 200, 10_000)
    }
  })

  client.on('error', (err) => {
    console.error('[Redis] error:', err.message)
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

const buildKey = (key: string) => `${REDIS_PREFIX}:${key}`

/** 写入字符串或对象（对象自动 JSON.stringify），可选 TTL（秒） */
export const setKv = async (
  key: string,
  value: unknown,
  ttlSeconds?: number
) => {
  const payload = typeof value === 'string' ? value : JSON.stringify(value)
  const k = buildKey(key)
  if (ttlSeconds && ttlSeconds > 0) {
    await redis.setex(k, ttlSeconds, payload)
  } else {
    await redis.set(k, payload)
  }
}

/** 读取字符串（不做反序列化） */
export const getKv = async (key: string): Promise<string | null> => {
  return redis.get(buildKey(key))
}

/** 读取并自动反序列化为 T，解析失败返回 null 而非抛错 */
export const getJsonKv = async <T>(key: string): Promise<T | null> => {
  const raw = await redis.get(buildKey(key))
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 删除单个 key */
export const delKv = async (key: string) => {
  await redis.del(buildKey(key))
}

/**
 * 按模式批量删除，使用 SCAN 避免 KEYS 阻塞。
 * 例：delKvByPattern('resource:*')
 */
export const delKvByPattern = async (pattern: string) => {
  const fullPattern = buildKey(pattern)
  const stream = redis.scanStream({ match: fullPattern, count: 200 })
  const pipeline = redis.pipeline()
  let count = 0
  for await (const keys of stream) {
    for (const k of keys as string[]) {
      pipeline.del(k)
      count++
    }
  }
  if (count > 0) await pipeline.exec()
  return count
}
