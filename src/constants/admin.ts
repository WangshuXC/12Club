import type { OverviewData } from '@/types/api/admin'

export const ADMIN_STATS_MAP: Record<keyof OverviewData, string> = {
  newUser: '新注册用户',
  newActiveUser: '活跃用户',
  newResource: '新发布资源',
  newResourcePatch: '新下载资源',
  newComment: '新发布评论'
}

export const ADMIN_STATS_SUM_MAP: Record<string, string> = {
  userCount: '总用户数',
  resourceCount: '总资源数',
  resourcePatchCount: '总下载资源数',
  commentCount: '总评论数'
}

export const ADMIN_WEBSITES_DATA = [
  {
    name: 'OpenList',
    url: 'http://12club.nankai.edu.cn/openlist',
    description: '12Club 资源存放网站'
  },
  {
    name: 'Beszel',
    url: 'http://12club.nankai.edu.cn:8090',
    description: '12Club 服务器性能监控'
  },
  {
    name: 'Umami',
    url: 'http://12club.nankai.edu.cn:3000',
    description: '12Club 网站统计'
  },
  {
    name: 'Uptime-Kuma',
    url: 'http://12club.nankai.edu.cn:3001',
    description: '12Club 服务器依赖监控'
  }
]
