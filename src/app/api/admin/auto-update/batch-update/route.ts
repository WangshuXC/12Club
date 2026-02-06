import { NextRequest, NextResponse } from 'next/server'

import { createPlayLinks } from '@/app/api/admin/resource/autoCreate/create'
import { getResourceFileList } from '@/app/api/admin/resource/autoCreate/get'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

import { prisma } from '../../../../../../prisma'

// POST - 批量更新所有资源的在线播放链接
export async function POST(req: NextRequest) {
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
