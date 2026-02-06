import { z } from 'zod'

import { prisma } from '../../../../../../../prisma'

const folderIdSchema = z.object({
  folderId: z.coerce.number().min(1).max(9999999)
})

export const deleteFolder = async (
  input: z.infer<typeof folderIdSchema>,
  uid: number
) => {
  const folder = await prisma.userResourceFavoriteFolder.findUnique({
    where: { id: input.folderId }
  })
  if (!folder) {
    return '未找到该收藏夹'
  }

  if (folder.user_id !== uid) {
    return '您没有权限删除该收藏夹'
  }

  await prisma.userResourceFavoriteFolder.delete({
    where: { id: input.folderId }
  })

  return {}
}
