import { flushViews } from '@/lib/viewCounter'

const FLUSH_INTERVAL_MS = 60_000
const FLUSH_TIMEOUT_MS = 45_000 // 单次 flush 超时，避免死锁

type SchedulerState = {
  timer: NodeJS.Timeout | null
  running: boolean
  shutdownHooked: boolean
}

const globalForScheduler = globalThis as unknown as {
  __viewCounterScheduler: SchedulerState | undefined
}

const state: SchedulerState = globalForScheduler.__viewCounterScheduler ?? {
  timer: null,
  running: false,
  shutdownHooked: false
}
globalForScheduler.__viewCounterScheduler = state

/** 给 promise 加超时，超时后 reject（原 promise 仍在后台，但不阻塞调度） */
const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`flush timeout ${ms}ms`)), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      }
    )
  })
}

/** 启动定时 flush（幂等，重复调用无副作用） */
export const startViewCounterScheduler = () => {
  if (state.timer) return

  state.timer = setInterval(async () => {
    if (state.running) return // 防止上一轮未完成时并发
    state.running = true
    try {
      const { flushed, failed } = await withTimeout(
        flushViews(),
        FLUSH_TIMEOUT_MS
      )

      if (flushed > 0 || failed > 0) {
        console.log(`[viewCounter] flushed=${flushed} failed=${failed}`)
      }
    } catch (err) {
      console.error('[viewCounter] flush 异常:', err)
    } finally {
      state.running = false
    }
  }, FLUSH_INTERVAL_MS)

  // 进程退出前尽力 flush 一次；只挂一次监听
  if (!state.shutdownHooked) {
    state.shutdownHooked = true
    const shutdown = async () => {
      if (state.timer) {
        clearInterval(state.timer)
        state.timer = null
      }
      try {
        await flushViews()
      } catch {
        /* ignore */
      }
    }
    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
    process.once('beforeExit', shutdown)
  }
}
