import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { UserInfo } from '@/types/api/user'
import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { prisma } from '../../../../../../prisma'

const getProfileSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})

export const getUserProfile = async (
  input: z.infer<typeof getProfileSchema>,
  currentUserUid: number
) => {
  try {
    // 获取用户基本信息
    const user = await prisma.user.findUnique({
      where: { id: input.id }
    })

    if (!user) {
      return '未找到用户'
    }

    // 获取用户评论数量
    const commentCount = await prisma.resourceComment.count({
      where: { user_id: input.id }
    })

    const resourcePatchCount = await prisma.resourcePatch.count({
      where: { user_id: input.id }
    })

    // 获取用户收藏资源数量
    const favoriteCount = await prisma.userResourceFavoriteFolderRelation.count({
      where: {
        folder: {
          user_id: input.id
        }
      }
    })

    const userInfo: UserInfo = {
      id: user.id,
      requestUserUid: currentUserUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      status: user.status,
      registerTime: user.register_time?.toISOString() || '',
      _count: {
        resource: 0,
        resource_patch: resourcePatchCount,
        resource_comment: commentCount,
        resource_favorite: favoriteCount
      }
    }

    return userInfo
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return error instanceof Error ? error.message : '获取用户信息时发生未知错误'
  }
}

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, getProfileSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie(req)

  const user = await getUserProfile(input, payload?.uid ?? 0)
  return NextResponse.json(user)
}
