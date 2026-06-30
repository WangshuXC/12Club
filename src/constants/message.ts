export const MESSAGE_TYPE = [
  'apply',
  'system',
  'pm',
  'like',
  'favorite',
  'comment',
  'follow',
  'pr',
  'feedback',
  'feedback_handle',
  'report',
  'report_handle',
  'mention',
  'resource_update',
  ''
] as const

export const MESSAGE_TYPE_MAP: Record<string, string> = {
  apply: '申请',
  system: '系统',
  pm: '私聊',
  like: '点赞',
  favorite: '收藏',
  comment: '评论',
  follow: '关注',
  pr: '更新请求',
  feedback: '反馈',
  feedback_handle: '反馈处理',
  report: '举报',
  report_handle: '举报处理',
  mention: '提到了您',
  resource_update: '资源更新'
}
