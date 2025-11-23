import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../prisma'
import { ParsePutBody } from '@/utils/parseQuery'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { revalidatePath } from 'next/cache'

// 定义请求体验证 schema，与 Card.tsx 中发送的数据结构对应
const removeFavoriteSchema = z.object({
  patchId: z.string(),
  folderId: z.number()
})

export const PUT = async (req: NextRequest) => {
  // 1. 解析并验证请求体
  const input = await ParsePutBody(req, removeFavoriteSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  // 2. 验证用户登录状态
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const { patchId, folderId } = input
  const uid = payload.uid

  // 3. 查找对应的资源 (Resource)
  // 前端传入的 patchId 对应数据库中的 db_id
  const resource = await prisma.resource.findUnique({
    where: { db_id: patchId }
  })

  if (!resource) {
    return NextResponse.json('未找到资源')
  }

  // 4. 查找收藏文件夹并验证权限
  const folder = await prisma.userResourceFavoriteFolder.findUnique({
    where: { id: folderId }
  })

  if (!folder) {
    return NextResponse.json('未找到收藏文件夹')
  }

  if (folder.user_id !== uid) {
    return NextResponse.json('这不是您的收藏夹')
  }

  // 5. 查找是否存在收藏关系
  const existing = await prisma.userResourceFavoriteFolderRelation.findUnique({
    where: {
      folder_id_db_id: {
        folder_id: folderId,
        db_id: resource.id
      }
    }
  })

  // 6. 如果存在则删除（移除收藏）
  if (existing) {
    await prisma.userResourceFavoriteFolderRelation.delete({
      where: {
        folder_id_db_id: {
          folder_id: folderId,
          db_id: resource.id
        }
      }
    })

    // 更新缓存
    revalidatePath(`/user/${uid}`)

    // 返回 added: false 表示已移除
    return NextResponse.json({ added: false })
  }

  // 如果本来就不存在，也视为移除成功
  return NextResponse.json({ added: false })
}