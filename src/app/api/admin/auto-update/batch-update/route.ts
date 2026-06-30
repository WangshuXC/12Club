import { NextRequest, NextResponse } from 'next/server'

import { createPlayLinks } from '@/app/api/admin/resource/autoCreate/create'
import { getResourceFileList } from '@/app/api/admin/resource/autoCreate/get'
import { prisma } from '@/lib/prisma'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

/**
 * 给收藏过该资源的用户发送资源更新通知。
 * 实现要点：
 * 1. content 不含集数等动态信息，仅资源名；
 *    保证"同一资源已存在未读 resource_update 消息"的用户不会被重复轰炸。
 * 2. 用 createMany 一次写入差集；无并发 N 次 DB 往返、不打爆连接池。
 */
const notifyResourceUpdate = async (
  resourceId: number,
  resourceName: string,
  dbId: string,
  senderId: number
) => {
  // 直接收藏 + 收藏夹收藏，合并去重
  const [directFavorites, folderFavorites] = await Promise.all([
    prisma.userResourceFavoriteRelation.findMany({
      where: { resource_id: resourceId },
      select: { user_id: true }
    }),
    prisma.userResourceFavoriteFolderRelation.findMany({
      where: { db_id: resourceId },
      select: { folder: { select: { user_id: true } } }
    })
  ])

  const recipientIds = new Set<number>()
  directFavorites.forEach((f) => recipientIds.add(f.user_id))
  folderFavorites.forEach((f) => recipientIds.add(f.folder.user_id))
  recipientIds.delete(senderId)

  if (recipientIds.size === 0) {
    return
  }

  const content = `您收藏的《${resourceName}》有新的更新`
  const link = `/${dbId}`

  // 用事务保证查询差集与写入的原子性，避免并发触发时重复插入
  await prisma.$transaction(async (tx) => {
    const existing = await tx.userMessage.findMany({
      where: {
        type: 'resource_update',
        basic_id: resourceId,
        status: 0,
        recipient_id: { in: Array.from(recipientIds) }
      },
      select: { recipient_id: true }
    })
    existing.forEach(
      (m) => m.recipient_id !== null && recipientIds.delete(m.recipient_id)
    )

    if (recipientIds.size === 0) {
      return
    }

    await tx.userMessage.createMany({
      data: Array.from(recipientIds).map((recipient_id) => ({
        type: 'resource_update',
        content,
        link,
        sender_id: senderId,
        recipient_id,
        basic_id: resourceId
      }))
    })
  })
}

// POST - 批量更新所有资源的在线播放链接
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  const payload = await verifyHeaderCookie()

  try {
    // 获取所有启用的自动更新资源
    const autoUpdateResources = await prisma.resourceAutoUpdate.findMany({
      where: { status: 1 },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            db_id: true,
            accordion_total: true,
            language: true
          }
        }
      }
    })

    if (autoUpdateResources.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有启用的自动更新资源',
        data: {
          total: 0,
          success: 0,
          failed: 0,
          details: []
        }
      })
    }

    const results = []
    let successCount = 0
    let failedCount = 0

    // 对每个资源执行创建/更新在线播放链接操作
    for (const autoUpdate of autoUpdateResources) {
      try {
        // 从 openlist 获取资源文件列表
        const fileListResult = await getResourceFileList(
          autoUpdate.resource.db_id
        )

        if (!fileListResult.success || !fileListResult.data) {
          failedCount++
          results.push({
            resourceId: autoUpdate.resource_id,
            resourceName: autoUpdate.resource.name,
            dbId: autoUpdate.resource.db_id,
            success: false,
            message: fileListResult.message || '获取文件列表失败'
          })
          continue
        }

        const linkList = fileListResult.data

        // 如果没有文件，跳过
        if (linkList.length === 0) {
          results.push({
            resourceId: autoUpdate.resource_id,
            resourceName: autoUpdate.resource.name,
            dbId: autoUpdate.resource.db_id,
            success: true,
            message: '目录为空，无需更新'
          })
          continue
        }

        // 调用 createPlayLinks 创建在线播放链接
        const result = await createPlayLinks(
          autoUpdate.resource_id,
          linkList,
          payload?.uid ?? 1
        )

        if (result.success && result.errors.length === 0) {
          successCount++

          // 更新最后更新时间
          await prisma.resourceAutoUpdate.update({
            where: { id: autoUpdate.id },
            data: { last_update_time: new Date() }
          })

          // 仅当有实际新增链接时才通知收藏用户；通知失败不影响主流程
          if (result.newLinksCount > 0) {
            try {
              await notifyResourceUpdate(
                autoUpdate.resource_id,
                autoUpdate.resource.name,
                autoUpdate.resource.db_id,
                payload?.uid ?? 1
              )
            } catch (notifyError) {
              console.error(
                `资源 ${autoUpdate.resource.name} 通知发送失败:`,
                notifyError
              )
            }
          }

          results.push({
            resourceId: autoUpdate.resource_id,
            resourceName: autoUpdate.resource.name,
            dbId: autoUpdate.resource.db_id,
            success: true,
            message: `成功创建/更新 ${result.newLinksCount} 个播放链接，当前共 ${result.playLinks.length} 个`
          })
        } else {
          failedCount++
          results.push({
            resourceId: autoUpdate.resource_id,
            resourceName: autoUpdate.resource.name,
            dbId: autoUpdate.resource.db_id,
            success: false,
            message:
              result.errors.length > 0
                ? result.errors.join(', ')
                : result.message || '创建失败'
          })
        }
      } catch (error) {
        failedCount++
        results.push({
          resourceId: autoUpdate.resource_id,
          resourceName: autoUpdate.resource.name,
          dbId: autoUpdate.resource.db_id,
          success: false,
          message: error instanceof Error ? error.message : '更新失败'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量更新完成：成功 ${successCount} 个，失败 ${failedCount} 个`,
      data: {
        total: autoUpdateResources.length,
        success: successCount,
        failed: failedCount,
        details: results
      }
    })
  } catch (error) {
    console.error('批量更新失败:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '批量更新时发生未知错误'
      },
      { status: 500 }
    )
  }
}
