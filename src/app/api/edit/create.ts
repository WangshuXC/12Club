import { z } from 'zod'

import { getRouteByDbId } from '@/utils/router'
import { resourceCreateSchema } from '@/validations/edit'

import { prisma } from '../../../../prisma'

import { uploadResourceImage } from './_upload'

export const createResource = async (
  input: Omit<z.infer<typeof resourceCreateSchema>, 'alias' | 'tag'> & {
    alias: string[]
    tag: string[]
  },
  uid: number
) => {
  const {
    name,
    author,
    translator,
    accordionTotal,
    language,
    dbId,
    alias,
    tag,
    banner,
    introduction,
    released
  } = input

  try {
    // 检查 dbId 是否与其他资源重复
    const existingResource = await prisma.resource.findFirst({
      where: {
        db_id: dbId,
      },
      select: {
        id: true,
        name: true
      }
    })

    if (existingResource) {
      return `${dbId} 已被资源${existingResource.name}使用，请使用其他 dbId`
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 创建资源记录
      const resource = await tx.resource.create({
        data: {
          name,
          language: [language], // language是数组字段
          accordion_total: Number(accordionTotal),
          db_id: dbId,
          author,
          translator,
          introduction,
          released,
          user_id: uid,

          // 设置默认值
          accordion: 0,
          status: 0,
          download: 0,
          view: 0,
          comment: 0
        },
        select: {
          id: true,
          db_id: true
        }
      })

      // 如果有别名，创建别名记录
      if (alias.length > 0) {
        const aliasData = alias.map((name) => ({
          name,
          resource_id: resource.id
        }))

        await tx.resourceAlias.createMany({
          data: aliasData
        })
      }

      // 如果有标签，创建标签记录
      if (tag.length > 0) {
        for (const tagName of tag) {
          // 查找或创建标签
          let tagRecord = await tx.resourceTag.findUnique({
            where: { name: tagName }
          })

          if (!tagRecord) {
            // 创建新标签
            tagRecord = await tx.resourceTag.create({
              data: {
                name: tagName,
                user_id: uid,
                count: 0
              }
            })
          }

          // 创建资源-标签关联
          await tx.resourceTagRelation.create({
            data: {
              resource_id: resource.id,
              tag_id: tagRecord.id
            }
          })

          // 更新标签计数
          await tx.resourceTag.update({
            where: { id: tagRecord.id },
            data: {
              count: {
                increment: 1
              }
            }
          })
        }
      }

      return resource
    })

    // 上传banner图片
    const bannerArrayBuffer = await banner.arrayBuffer()
    const uploadResult = await uploadResourceImage(
      bannerArrayBuffer,
      result.db_id
    )
    if (typeof uploadResult === 'string') {
      return uploadResult
    }

    // 更新资源的图片链接
    const imageLink = `${process.env.IMAGE_BED_URL}/resource${getRouteByDbId(result.db_id)}/banner.avif`
    await prisma.resource.update({
      where: { db_id: result.db_id },
      data: { image_url: imageLink }
    })

    return { dbId: result.db_id }
  } catch (error) {
    console.error('创建资源失败:', error)
    return error instanceof Error ? error.message : '创建资源时发生未知错误'
  }
}
