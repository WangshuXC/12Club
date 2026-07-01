import { prisma } from '@/lib/prisma'

interface OpenlistTokenResult {
  success: boolean
  message: string
  token?: string
}

/**
 * 获取 Openlist API Token
 * @returns {Promise<OpenlistTokenResult>} 包含成功状态、消息和 token 的对象
 */
export async function getOpenlistToken(): Promise<OpenlistTokenResult> {
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
  }
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
async function fetchOpenlistPathSize(path: string): Promise<number | null> {
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
 * 获取指定 patch 对应 openlist 路径的文件总大小（格式化字符串）
 * 优先读取 resource_patch.size；若为空则调用 openlist API 并写回数据库
 * @param patchId patch 记录 id
 * @param path openlist 路径，例如 '/resource/anime/axxx'
 * @returns 格式化后的大小字符串；失败时返回空字符串
 */
export async function getOpenlistPathSize(
  patchId: number,
  path: string
): Promise<string> {
  const patch = await prisma.resourcePatch.findUnique({
    where: { id: patchId },
    select: { size: true }
  })

  if (patch?.size) {
    return patch.size
  }

  const bytes = await fetchOpenlistPathSize(path)
  if (bytes === null || bytes <= 0) {
    return ''
  }

  const formatted = formatBytes(bytes)

  await prisma.resourcePatch.update({
    where: { id: patchId },
    data: { size: formatted }
  })

  return formatted
}
