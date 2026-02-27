import { z } from 'zod'

import { adminDeleteSeriesSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

export const deleteSeries = async (
  input: z.infer<typeof adminDeleteSeriesSchema>
) => {
  try {
    // 检查系列是否存在
    const existingSeries = await prisma.resourceSeries.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true,
        resources: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingSeries) {
      return '系列不存在'
    }

    // 删除系列（级联删除会自动处理关联关系）
    await prisma.resourceSeries.delete({
      where: { id: input.id }
    })

    return {
      success: true,
      message: `系列 "${existingSeries.name}" 已成功删除，共移除了 ${existingSeries.resources.length} 个资源关联`
    }
  } catch (error) {
    console.error('删除系列失败:', error)
    return error instanceof Error ? error.message : '删除系列时发生未知错误'
  }
}
