import { z } from 'zod'

import { getOpenlistPathSize } from '@/lib/openlist'
import { prisma } from '@/lib/prisma'
import { getRouteByDbId } from '@/utils/router'

import type { PatchResource } from '@/types/api/patch'

const dbIdSchema = z.object({
  dbId: z.coerce.string().min(1).max(9999999)
})

export const getPatchResource = async (input: z.infer<typeof dbIdSchema>) => {
  const { dbId } = input

  try {
    // 查找当前资源
    const currentResource = await prisma.resource.findUnique({
      where: { db_id: dbId },
      select: { id: true, language: true, db_id: true }
    })

    if (!currentResource) {
      return 'Resource not found'
    }

    // 查找所有相关的patch
    const patchDataList = await prisma.resourcePatch.findMany({
      where: { resource_id: currentResource.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 对 storage === 'alist' 的 patch，优先读 DB size，缺失则调 openlist API 并回写
    const alistPath = `/resource${getRouteByDbId(currentResource.db_id)}`
    const alistSizeMap = new Map<number, string>()
    await Promise.all(
      patchDataList
        .filter((p) => p.storage === 'alist')
        .map(async (p) => {
          const size = await getOpenlistPathSize(p.id, alistPath)
          alistSizeMap.set(p.id, size)
        })
    )

    const resources: PatchResource[] = patchDataList?.map((patchData) => ({
      id: patchData.id,
      name: patchData.name,
      section: patchData.section,
      dbId: currentResource?.db_id ?? '',
      storage: patchData.storage,
      size:
        patchData.storage === 'alist'
          ? (alistSizeMap.get(patchData.id) ?? patchData.size)
          : patchData.size,
      language: patchData.language,
      note: patchData.note,
      hash: patchData.hash,
      content: patchData.content,
      code: patchData.code,
      password: patchData.password,
      likeCount: 0,
      isLike: false,
      status: patchData.status,
      userId: patchData.user_id,
      resourceId: patchData.resource_id,
      created: patchData.created.toISOString(),
      user: {
        id: patchData.user.id,
        name: patchData.user.name,
        avatar: patchData.user.avatar
      }
    }))

    return resources
  } catch (error) {
    console.error('获取patch列表失败:', error)
    return error instanceof Error
      ? error.message
      : '获取patch列表时发生未知错误'
  }
}
