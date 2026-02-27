import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ParsePutBody } from '@/utils/parseQuery'
import { updatePatchResourceStatsSchema } from '@/validations/patch'

import { prisma } from '../../../../../prisma'

export const downloadStats = async (
  input: z.infer<typeof updatePatchResourceStatsSchema>
) => {
  try {
    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 获取当前资源的下载数
      const currentResource = await tx.resource.findUnique({
        where: { id: input.resourceId },
        select: { download: true, updated: true }
      })

      // 获取当前patch的下载数
      const currentPatch = await tx.resourcePatch.findUnique({
        where: { id: input.patchId },
        select: { download: true }
      })

      if (!currentResource || !currentPatch) {
        throw new Error('资源或补丁不存在')
      }

      // 更新资源下载数
      await tx.resource.update({
        where: { id: input.resourceId },
        data: {
          download: currentResource.download + 1,
          updated: currentResource.updated
        }
      })

      // 更新patch下载数
      await tx.resourcePatch.update({
        where: { id: input.patchId },
        data: { download: currentPatch.download + 1 }
      })
    })

    return {}
  } catch (error) {
    console.error('更新下载统计失败:', error)
    return error instanceof Error ? error.message : '更新下载统计时发生未知错误'
  }
}

export const PUT = async (req: NextRequest) => {
  const input = await ParsePutBody(req, updatePatchResourceStatsSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await downloadStats(input)

  return NextResponse.json(response)
}
