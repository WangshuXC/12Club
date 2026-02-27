import { ROUTER_MAP, type RouterPrefix } from '@/constants/resource'

/**
 * 根据dbId的首位字母获取对应的路由
 * @param dbId - 数据库ID
 * @returns 完整的路由路径，如果首位字母不匹配则返回null
 */
export function getRouteByDbId(dbId: string): string {
  if (!dbId || dbId.length === 0) {
    return ''
  }

  const prefix = dbId.charAt(0).toLowerCase() as RouterPrefix

  if (prefix in ROUTER_MAP) {
    return `/${ROUTER_MAP[prefix]}/${dbId}`
  }

  return ''
}

/**
 * 检查dbId是否有效（首位字母是否在支持的路由映射中）
 * @param dbId - 数据库ID
 * @returns 是否为有效的dbId
 */
export function isValidDbId(dbId: string): boolean {
  if (!dbId || dbId.length === 0) {
    return false
  }

  const prefix = dbId.charAt(0).toLowerCase() as RouterPrefix

  return prefix in ROUTER_MAP
}

/**
 * 根据dbId获取资源类型
 * @param dbId - 数据库ID
 * @returns 资源类型（anime、comic、novel）或null
 */
export function getResourceTypeByDbId(dbId: string): string | null {
  if (!dbId || dbId.length === 0) {
    return null
  }

  const prefix = dbId.charAt(0).toLowerCase() as RouterPrefix

  if (prefix in ROUTER_MAP) {
    return ROUTER_MAP[prefix]
  }

  return null
}
