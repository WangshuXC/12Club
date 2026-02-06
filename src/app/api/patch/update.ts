import { z } from 'zod'

import { patchResourceUpdateSchema } from '@/validations/patch'

import { prisma } from '../../../../prisma'

import type { PatchResource } from '@/types/api/patch'

export const updatePatchResource = async (
  input: z.infer<typeof patchResourceUpdateSchema>,
  uid: number,
  userRole: number
) => {
  const { patchId, dbId, ...resourceData } = input

  try {
    // 查找当前patch
    const currentPatch = await prisma.resourcePatch.findUnique({
      where: { id: patchId },
      select: { id: true, user_id: true }
    })

    if (!currentPatch) {
      return '未找到该资源'
    }

    // 查找当前资源
    const currentResource = await prisma.resource.findUnique({
      where: { db_id: dbId },
      select: { id: true, language: true, db_id: true }
    })

    const resourceUserUid = currentPatch.user_id
    if (currentPatch.user_id !== uid && userRole < 3) {
      return '您没有权限更改该资源'
    }

    // 更新patch
    const patchData = await prisma.resourcePatch.update({
      where: { 
        id: currentPatch.id,
        user_id: resourceUserUid
      },
      data: {
        ...resourceData
      },
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

    const resource: PatchResource = {
      id: patchData.id,
      name: patchData.name,
      section: patchData.section,
      dbId: currentResource?.db_id ?? '',
      storage: patchData.storage,
      size: patchData.size,
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
    }

    return resource
  } catch (error) {
    console.error('更新patch失败:', error)
    return error instanceof Error ? error.message : '更新patch时发生未知错误'
  }
}
