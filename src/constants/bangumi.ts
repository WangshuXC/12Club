/**
 * Bangumi API 域名配置
 *
 * 优先使用国内代理域名，直连访问；
 * 若代理不可用（请求失败或返回非 2xx），自动回退到官方域名。
 */
export const BANGUMI_API_HOSTS = [
  'https://api.bangumi.one',
  'https://api.bgm.tv'
] as const

/**
 * 依次尝试所有 Bangumi API 域名，返回第一个成功的响应。
 *
 * @param path 以 `/` 开头的接口路径，例如 `/v0/subjects/1`
 * @param init 与 `fetch` 相同的初始化参数
 */
export const fetchBangumi = async (
  path: string,
  init?: RequestInit
): Promise<Response> => {
  let lastError: unknown = null

  for (const host of BANGUMI_API_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, init)
      if (res.ok) {
        return res
      }

      lastError = new Error(`Bangumi API ${host} 响应异常: ${res.status}`)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Bangumi API 请求失败')
}
