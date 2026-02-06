import { z } from 'zod'

import { patchResourceCreateSchema } from '@/validations/patch'

import { prisma } from '../../../../prisma'

import type { PatchResource } from '@/types/api/patch'

export const createPatchResource = async (
  input: z.infer<typeof patchResourceCreateSchema>,
  uid: number
) => {
  const { dbId, language, content, storage, ...resourceData } = input

  try {
    // 查找当前资源
    const currentResource = await prisma.resource.findUnique({
      where: { db_id: dbId },
      select: { id: true, language: true, db_id: true }
    })

    if (!currentResource) {
      return 'Resource not found'
    }

    // 创建patch记录
    const patchData = await prisma.resourcePatch.create({
      data: {
        storage,
        section: input.section || '',
        name: resourceData.name || '',
        size: resourceData.size || '',
        code: resourceData.code || '',
        password: resourceData.password || '',
        note: resourceData.note || '',
        hash: resourceData.hash || '',
        content,
        language: language || [],
        download: 0,
        status: 0,
        user_id: uid,
        resource_id: currentResource.id
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
    console.error('创建patch失败:', error)
    return error instanceof Error ? error.message : '创建patch时发生未知错误'
  }
}
