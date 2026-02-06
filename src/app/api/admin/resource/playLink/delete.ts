import { z } from 'zod'

import { adminDeleteResourcePlayLinkQuerySchema } from '@/validations/admin'

import { prisma } from '../../../../../../prisma'

export const deleteResourcePlayLink = async (
  input: z.infer<typeof adminDeleteResourcePlayLinkQuerySchema>
) => {
  const { id } = input

  try {
    // 检查播放链接是否存在
    const existingPlayLink = await prisma.resourcePlayLink.findUnique({
      where: { id },
      select: {
        id: true,
        accordion: true,
        resource: {
          select: {
            name: true
          }
        }
      }
    })

    if (!existingPlayLink) {
      return {
        success: false,
        message: '播放链接不存在'
      }
    }

    // 删除播放链接
    await prisma.resourcePlayLink.delete({
      where: { id }
    })

    return {
      success: true,
      message: `${existingPlayLink.resource.name} 第 ${existingPlayLink.accordion} 集的播放链接删除成功`
    }
  } catch (error) {
    console.error('删除播放链接失败:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '删除播放链接时发生未知错误'
    }
  }
} 