import { prisma } from '@/lib/prisma'

interface OpenlistTokenResult {
  success: boolean
  message: string
  token?: string
}

// token 进程内缓存，避免每次调用都重新登录 openlist
let cachedToken: { token: string; expireAt: number } | null = null
// 正在进行的登录请求，让并发首次调用共享同一个 promise，避免重复登录
let tokenInFlight: Promise<OpenlistTokenResult> | null = null
// openlist 默认 token 有效期约 48h，这里保守缓存 30 分钟
const TOKEN_TTL_MS = 30 * 60 * 1000

/** 清空 token 缓存，供上层在遇到 401/403 时调用 */
export function invalidateOpenlistToken() {
  cachedToken = null
}

/**
 * 获取 Openlist API Token
 * @returns {Promise<OpenlistTokenResult>} 包含成功状态、消息和 token 的对象
 */
export async function getOpenlistToken(): Promise<OpenlistTokenResult> {
  if (cachedToken && cachedToken.expireAt > Date.now()) {
    return { success: true, message: '命中缓存', token: cachedToken.token }
  }

  // 已有登录请求在飞，直接复用
  if (tokenInFlight) {
    return tokenInFlight
  }

  tokenInFlight = (async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_OPENLIST_API_ADRESS}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: process.env.NEXT_OPENLIST_ADMIN_NAME,
            password: process.env.NEXT_OPENLIST_ADMIN_PASSWORD
          })
        }
      )

      if (!response.ok) {
        return {
          success: false,
          message: `获取token失败: HTTP ${response.status} ${response.statusText}`
        }
      }

      const tokenData = await response.json()

      if (tokenData?.code !== 200 || !tokenData?.data?.token) {
        return {
          success: false,
          message: `获取token失败: ${tokenData?.message || '返回数据异常'}`
        }
      }

      cachedToken = {
        token: tokenData.data.token,
        expireAt: Date.now() + TOKEN_TTL_MS
      }

      return {
        success: true,
        message: '获取token成功',
        token: tokenData.data.token
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : '获取token时发生未知错误'
      }
    } finally {
      tokenInFlight = null
    }
  })()

  return tokenInFlight
}

/**
 * 格式化字节数为人类可读字符串
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const value = bytes / Math.pow(1024, i)

  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 2)} ${units[i]}`
}

/**
 * 调用 openlist API 获取指定路径下文件总大小（字节），仅统计一级文件（不递归子目录）
 * @param path openlist 路径，例如 '/resource/anime/axxx'
 * @returns 字节数；失败时返回 null
 */
async function fetchOpenlistPathSize(
  path: string,
  retried = false
): Promise<number | null> {
  try {
    const tokenResult = await getOpenlistToken()
    if (!tokenResult.success || !tokenResult.token) {
      return null
    }

    const response = await fetch(
      `${process.env.NEXT_OPENLIST_API_ADRESS}/fs/list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: tokenResult.token
        },
        body: JSON.stringify({ path })
      }
    )

    // token 失效（401/403）时清空缓存并重试一次
    if ((response.status === 401 || response.status === 403) && !retried) {
      invalidateOpenlistToken()

      return fetchOpenlistPathSize(path, true)
    }

    if (!response.ok) {
      return null
    }

    const json = await response.json()
    const content: Array<{ name: string; size?: number; is_dir?: boolean }> =
      json?.data?.content ?? []

    return content
      .filter((item) => item.name !== 'banner.avif' && !item.is_dir)
      .reduce((sum, item) => sum + (item.size ?? 0), 0)
  } catch {
    return null
  }
}

/**
 * 批量获取多个 patch 对应 openlist 路径的文件总大小
 * 与逐条调用相比，此实现：
 *   1. 只用一次 findMany 读所有 patch.size，避免在 HTTP 期间持有 DB 连接
 *   2. 只对 size 缺失的项发起 openlist 请求
 *   3. openlist 失败的项也会在返回 map 中置空串，保持与旧单条实现一致的语义
 *   4. 回写采用顺序 update，避免与其它请求争抢连接池
 * @param items 需要查询的 patch 列表
 * @returns Map<patchId, sizeString>（openlist 失败的项 value 为 ''）
 */
export async function getOpenlistPathSizes(
  items: Array<{ patchId: number; path: string }>
): Promise<Map<number, string>> {
  const result = new Map<number, string>()
  if (items.length === 0) {
    return result
  }

  // 1) 一次性拉取所有 patch 已有 size（尽早释放连接）
  const ids = items.map((i) => i.patchId)
  const existing = await prisma.resourcePatch.findMany({
    where: { id: { in: ids } },
    select: { id: true, size: true }
  })
  const existingMap = new Map(existing.map((p) => [p.id, p.size]))

  // 2) 分离已缓存和需要请求 openlist 的项
  const pending: typeof items = []
  for (const item of items) {
    const size = existingMap.get(item.patchId)
    if (size) {
      result.set(item.patchId, size)
    } else {
      pending.push(item)
    }
  }

  if (pending.length === 0) {
    return result
  }

  // 3) 并行请求 openlist，不占用 DB 连接
  const fetched = await Promise.all(
    pending.map(async ({ patchId, path }) => {
      const bytes = await fetchOpenlistPathSize(path)
      if (bytes === null || bytes <= 0) {
        return { patchId, formatted: '' }
      }

      return { patchId, formatted: formatBytes(bytes) }
    })
  )

  // 4) 全部结果都写入 map（含空串，保持旧语义）
  for (const { patchId, formatted } of fetched) {
    result.set(patchId, formatted)
  }

  // 5) 仅对有效值执行回写，顺序执行避免抢占连接池
  const toUpdate = fetched.filter((f) => f.formatted)
  for (const { patchId, formatted } of toUpdate) {
    try {
      await prisma.resourcePatch.update({
        where: { id: patchId },
        data: { size: formatted }
      })
    } catch {
      // 回写失败不影响读取结果
    }
  }

  return result
}

/**
 * 获取单个 patch 对应 openlist 路径的文件总大小（格式化字符串）
 * 内部委托给批量版本，保持逻辑单一来源
 */
export async function getOpenlistPathSize(
  patchId: number,
  path: string
): Promise<string> {
  const map = await getOpenlistPathSizes([{ patchId, path }])

  return map.get(patchId) ?? ''
}
