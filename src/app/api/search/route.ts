import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { ParsePostBody } from '@/utils/parseQuery'
import { searchSchema } from '../../../validations/search'
import { prisma } from '../../../../prisma'
import { Prisma } from '@prisma/client'

const searchData = async (input: z.infer<typeof searchSchema>) => {
  // input: {query: ["胆大党", "dandadan"], page: 1, limit: 10, searchOption: {searchInIntroduction: false, searchInAlias: true, searchInTag: false}}
  const { query, page, limit, searchOption } = input
  const offset = (page - 1) * limit

  try {
    // 构建搜索条件 - 对每个关键词在多个字段中搜索
    const searchConditions: Prisma.ResourceWhereInput[] = query.flatMap((keyword) => {
      const keywordConditions: Prisma.ResourceWhereInput[] = [
        // 在名称中搜索 (必选)
        { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
      ]

      // 动态添加简介搜索条件
      if (searchOption.searchInIntroduction) {
        keywordConditions.push({
          introduction: { contains: keyword, mode: Prisma.QueryMode.insensitive }
        })
      }

      // 动态添加别名搜索条件
      if (searchOption.searchInAlias) {
        keywordConditions.push({
          aliases: {
            some: {
              name: { contains: keyword, mode: Prisma.QueryMode.insensitive }
            }
          }
        })
      }

      // 动态添加标签/类型搜索条件
      if (searchOption.searchInTag) {
        keywordConditions.push({
          type: { 
            has: keyword  // 搜索type数组中是否包含该关键词
          }
        })
        keywordConditions.push({
          language: { 
            has: keyword  // 搜索language数组中是否包含该关键词
          }
        })
      }

      return keywordConditions
    })

    // 构建查询条件 - 使用OR连接所有搜索条件
    const whereCondition: Prisma.ResourceWhereInput = {
      OR: searchConditions
    }

    // 获取搜索结果 - 按相关性排序（这里用view作为简单的相关性指标）
    const data = await prisma.resource.findMany({
      where: whereCondition,
      select: {
        name: true,
        image_url: true,
        db_id: true,
        view: true,
        download: true,
        comment: true
      },
      orderBy: {
        view: 'desc'  // 按浏览量降序排列，作为简单的相关性排序
      },
      skip: offset,
      take: limit
    })

    // 获取总数
    const count = await prisma.resource.count({
      where: whereCondition
    })

    const _data = data?.map((data) => {
      return {
        title: data.name,
        image: data.image_url,
        dbId: data.db_id,
        view: data.view,
        download: data.download,
        comment: data.comment,
        _count: {
          favorite_by: Math.floor(Math.random() * 300),
          comment: Math.floor(Math.random() * 200)
        }
      }
    })

    return { _data, total: count }
  } catch (error) {
    console.error('Error searching data:', error)
    throw error
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const input = await ParsePostBody(req, searchSchema)
    if (typeof input === 'string') {
      return NextResponse.json(input)
    }

    const response = await searchData(input)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json(
      { error: 'Failed to search data' },
      { status: 500 }
    )
  }
}
