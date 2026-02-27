import type { ResourceComment } from '@/types/api/comment'

export const processComments = (comments: any[]) => {
  // 创建带回复结构的 Map
  const commentMap = new Map<number, any>()
  comments?.forEach((comment) => {
    // 初始化每个评论对象并添加 replies 数组
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
      parentId: comment.parent_id,
      parentComment: null,
      parent_id: undefined,
      userId: comment.user.id,
      resourceId: comment.resource_id,
      resource_id: undefined,
      isLike: comment.likes.length > 0,
      likeCount: comment._count.likes
    })
  })

  // 构建回复层级关系
  comments?.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id)
      parent?.replies.push(commentMap.get(comment.id)) // 将子评论添加到父级的 replies 数组
    }
  })

  // 第三阶段：为所有评论添加 parentComment（包括 replies 中的）
  commentMap.forEach((comment) => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId)
      comment.parentComment = parent
        ? {
            id: parent.id,
            content: parent.content,
            created: parent.created,
            user: parent.user
          }
        : null
    }
  })

  return Array.from(commentMap.values()) as ResourceComment[]
}
