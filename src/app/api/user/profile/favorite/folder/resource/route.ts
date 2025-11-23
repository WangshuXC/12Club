import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery } from '@/utils/parseQuery'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { prisma } from '../../../../../../../../prisma'
import { getFavoriteFolderResourceSchema } from '@/validations/user'
import type { ResourceData } from '@/types/api/resource'

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, getFavoriteFolderResourceSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const payload = await verifyHeaderCookie()

  const res = await getResourceByFolder(input, payload?.uid ?? 0)
  return NextResponse.json(res)
}

const getResourceByFolder = async (
  input: z.infer<typeof getFavoriteFolderResourceSchema>,
  uid?: number
) => {
  const folder = await prisma.userResourceFavoriteFolder.findUnique({
    where: { id: input.folderId }
  })
  if (!folder) {
    return '未找到该文件夹'
  }
  if (!folder.is_public && folder.user_id !== uid) {
    return '您无权查看该私密文件夹'
  }

  const { page, limit } = input
  const offset = (page - 1) * limit

  const total = await prisma.userResourceFavoriteFolderRelation.count({
    where: { folder_id: input.folderId }
  })

  const relations = await prisma.userResourceFavoriteFolderRelation.findMany({
    where: { folder_id: input.folderId },
    include: {
      resource: {
        include: {
          _count: {
            select: {
              favorite_folders: true,
              favorites: true,
              comments: true
            }
          }
        }
      }
    },
    skip: offset,
    take: limit,
    orderBy: { created: 'desc' }
  })

  const resources: ResourceData[] = relations.map((relation: any) => ({
    id: relation.resource.id,
    dbId: relation.resource.db_id,
    name: relation.resource.name,
    image: relation.resource.image_url,
    title: relation.resource.name,
    view: relation.resource.view,
    download: relation.resource.download,
    type: relation.resource.type,
    language: relation.resource.language,
    created: relation.resource.created,
    comment: relation.resource.comment,
    status: relation.resource.status,
    _count: {
      favorite_by: relation.resource._count.favorite_folders,
      comment: relation.resource._count.comments
    }
  }))

  return { resources, total }
}
