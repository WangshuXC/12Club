import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { ParsePutBody } from '@/utils/parseQuery'
import { updatePatchResourceStatsSchema } from '@/validations/patch'

const downloadStats = async (
  input: z.infer<typeof updatePatchResourceStatsSchema>
) => {
  try {
    // 使用原子 increment 避免并发丢失更新，并用批量事务保证原子性
    // 相比交互式事务（$transaction(async tx => ...)）不会因超时抛出 P2028
    await prisma.$transaction([
      prisma.resource.update({
        where: { id: input.resourceId },
        data: { download: { increment: 1 } }
      }),
      prisma.resourcePatch.update({
        where: { id: input.patchId },
        data: { download: { increment: 1 } }
      })
    ])

    return {}
  } catch (error) {
    console.error('更新下载统计失败:', error)
    // P2025：目标记录不存在
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return '资源或补丁不存在'
    }
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
