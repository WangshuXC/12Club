import { z } from 'zod'

import { prisma } from '../../../../../../../prisma'

import type { UserFavoriteResourceFolder } from '@/types/api/user'

const dbIdSchema = z.object({
  dbId: z.coerce.string().min(1).max(10).optional()
})

export const getFolders = async (
  input: z.infer<typeof dbIdSchema>,
  pageUid: number,
  currentUserUid: number
) => {
  const folders = await prisma.userResourceFavoriteFolder.findMany({
    where: {
      user_id: pageUid,
      is_public: pageUid !== currentUserUid ? true : undefined
    },
    include: {
      resource: input.dbId
        ? {
            where: {
              resource: {
                db_id: input.dbId
              }
            }
          }
        : false,
      _count: {
        select: { resource: true }
      }
    }
  })

  const response: UserFavoriteResourceFolder[] = folders.map((f: any) => ({
    name: f.name,
    id: f.id,
    description: f.description,
    is_public: f.is_public,
    isAdd: f.resource?.length > 0,
    _count: f._count
  }))

  return response
}
