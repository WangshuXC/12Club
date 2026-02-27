import { z } from 'zod'

import { adminUpdateSeriesSchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

export const updateSeries = async (
  input: z.infer<typeof adminUpdateSeriesSchema>
) => {
  try {
    // 检查系列是否存在
    const existingSeries = await prisma.resourceSeries.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        name: true
      }
    })

    if (!existingSeries) {
      return '系列不存在'
    }

    // 检查系列名称是否与其他系列重复
    const duplicateSeries = await prisma.resourceSeries.findFirst({
      where: {
        name: input.name,
        id: { not: input.id } // 排除当前正在更新的系列
      },
      select: {
        id: true,
        name: true
      }
    })

    if (duplicateSeries) {
      return `系列名称 "${input.name}" 已被其他系列使用，请使用其他名称`
    }

    // 更新系列
    await prisma.resourceSeries.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description || ''
      }
    })

    return {
      success: true,
      message: `系列 "${input.name}" 更新成功`
    }
  } catch (error) {
    console.error('更新系列失败:', error)
    return error instanceof Error ? error.message : '更新系列时发生未知错误'
  }
}
