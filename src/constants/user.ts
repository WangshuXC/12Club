export const USER_ROLE_MAP: Record<number, string> = {
  1: '用户',
  2: '创作者',
  3: '管理员',
  4: '超级管理员'
}

export const USER_ROLE_COLOR_MAP: Record<
  number,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
> = {
  1: 'default', // 用户 - 默认颜色
  2: 'primary', // 创作者 - 蓝色
  3: 'warning', // 管理员 - 橙色/黄色
  4: 'danger' // 超级管理员 - 红色
}

export const USER_STATUS_MAP: Record<number, string> = {
  0: '正常',
  2: '封禁'
}

export const USER_STATUS_COLOR_MAP: Record<
  number,
  'success' | 'warning' | 'danger'
> = {
  0: 'success',
  1: 'warning',
  2: 'danger'
}
