import { z } from 'zod'

import { USER_FAVORITE_PATCH_FOLDER_LIMIT } from '@/config/user'
import { createFavoriteFolderSchema } from '@/validations/user'

import { prisma } from '../../../../../../../prisma'

import type { UserFavoriteResourceFolder } from '@/types/api/user'

export const createFolder = async (
  input: z.infer<typeof createFavoriteFolderSchema>,
  uid: number
) => {
  const folderCount = await prisma.userResourceFavoriteFolder.count({
    where: { user_id: uid }
  })
  if (folderCount > USER_FAVORITE_PATCH_FOLDER_LIMIT) {
    return `您最多创建 ${USER_FAVORITE_PATCH_FOLDER_LIMIT} 个收藏文件夹`
  }

  const folder = await prisma.userResourceFavoriteFolder.create({
    data: {
      name: input.name,
      description: input.description,
      is_public: input.isPublic,
      user_id: uid
    },
    include: {
      _count: {
        select: { resource: true }
      }
    }
  })

  const response: UserFavoriteResourceFolder = {
    name: folder.name,
    id: folder.id,
    description: folder.description,
    is_public: folder.is_public,
    isAdd: false,
    _count: folder._count
  }

  return response
}
