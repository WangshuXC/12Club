import { NextRequest } from 'next/server'

import { ParseGetQuery } from '@/utils/parseQuery'
import { adminSearchTagSchema } from '@/validations/admin'

import { prisma } from '../../../../prisma'

export async function GET(req: NextRequest) {
  const query = ParseGetQuery(req, adminSearchTagSchema)

  if (typeof query === 'string') {
    return Response.json({ error: query }, { status: 400 })
  }

  try {
    // 搜索标签，按名称模糊匹配
    const tags = await prisma.resourceTag.findMany({
      where: {
        name: {
          contains: query.search,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        count: true
      },
      orderBy: [
        { count: 'desc' }, // 优先显示资源数量多的标签
        { name: 'asc' } // 同数量按名称排序
      ],
      take: 10 // 最多返回10个结果
    })

    return Response.json({
      data: tags,
      message: '获取标签列表成功',
      status: 200
    })
  } catch (error) {
    console.error('搜索标签失败:', error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : '搜索标签时发生未知错误',
        status: 500
      },
      { status: 500 }
    )
  }
}
