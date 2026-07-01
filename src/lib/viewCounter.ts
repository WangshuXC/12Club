import { prisma } from '@/lib/prisma'
import { redis, REDIS_PREFIX } from '@/lib/redis'

/**
 * 浏览数攒批：
 * - 每次访问 incrementView() 只写 Redis（INCR），不写 DB
 * - 后台任务定时 flush 到 DB
 */

const pendingKey = (id: number) => `${REDIS_PREFIX}:view:pending:${id}`
const DIRTY_SET = `${REDIS_PREFIX}:view:dirty`

/**
 * 累计一次浏览（仅写 Redis）
 * @returns 累计后的最新 pending 值；Redis 异常时返回 0（降级但不阻塞主流程）
 */
export const incrementView = async (resourceId: number): Promise<number> => {
  try {
    // MULTI 返回 [[null, incrResult], [null, saddResult]]
    const result = await redis
      .multi()
      .incr(pendingKey(resourceId))
      .sadd(DIRTY_SET, resourceId.toString())
      .exec()
    const next = result?.[0]?.[1] as number | undefined

    return typeof next === 'number' ? next : 0
  } catch (err) {
    // Redis 挂了不影响主流程
    console.error('[viewCounter] incr 失败:', err)

    return 0
  }
}

/** 读取某个资源的未 flush 增量（用于展示实时值） */
export const getPendingView = async (resourceId: number): Promise<number> => {
  try {
    const v = await redis.get(pendingKey(resourceId))

    return v ? parseInt(v, 10) || 0 : 0
  } catch {
    return 0
  }
}

/** 批量读取多个资源的未 flush 增量 */
export const getPendingViews = async (
  resourceIds: number[]
): Promise<Map<number, number>> => {
  const result = new Map<number, number>()
  if (resourceIds.length === 0) return result

  try {
    const values = await redis.mget(resourceIds.map(pendingKey))
    resourceIds.forEach((id, i) => {
      result.set(id, values[i] ? parseInt(values[i]!, 10) || 0 : 0)
    })
  } catch (err) {
    console.error('[viewCounter] mget 失败:', err)
  }

  return result
}

/**
 * 将 Redis 累计增量刷入 PostgreSQL。
 * 使用 MULTI(GET+DEL) 原子"读取即清零"，flush 期间的新增不会丢失。
 * （Redis Server < 6.2 不支持 GETDEL，故用 MULTI 组合替代）
 * 单次 DB 失败仅回滚该资源，其它继续。
 */
export const flushViews = async (): Promise<{
  flushed: number
  failed: number
}> => {
  let flushed = 0
  let failed = 0

  try {
    // 一次性拿走所有脏 id
    const ids = await redis.spop(DIRTY_SET, 10_000)

    if (!ids || ids.length === 0) return { flushed: 0, failed: 0 }

    for (const idStr of ids) {
      const resourceId = parseInt(idStr, 10)
      if (!Number.isFinite(resourceId)) continue

      // MULTI(GET+DEL)：原子读取并删除，保证并发写入的新增计数不会丢
      let delta = 0

      try {
        const key = pendingKey(resourceId)
        const result = await redis.multi().get(key).del(key).exec()
        // result: [[null, '<value>'], [null, <delCount>]]
        const raw = result?.[0]?.[1] as string | null | undefined

        delta = raw ? parseInt(raw, 10) || 0 : 0
      } catch (err) {
        console.error(`[viewCounter] 读取增量失败 id=${resourceId}:`, err)
        continue
      }

      if (delta <= 0) continue

      try {
        await prisma.resource.update({
          where: { id: resourceId },
          data: { view: { increment: delta } }
        })
        flushed++
      } catch (err) {
        failed++
        console.error(
          `[viewCounter] DB 更新失败 id=${resourceId} delta=${delta}:`,
          err
        )
        // 回滚：把 delta 加回 Redis，并重新标脏，等下次 flush

        try {
          await redis
            .multi()
            .incrby(pendingKey(resourceId), delta)
            .sadd(DIRTY_SET, idStr)
            .exec()
        } catch (rollbackErr) {
          console.error(`[viewCounter] 回滚失败 id=${resourceId}:`, rollbackErr)
        }
      }
    }
  } catch (err) {
    console.error('[viewCounter] flush 主流程异常:', err)
  }

  return { flushed, failed }
}
