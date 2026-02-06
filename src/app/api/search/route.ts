import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ParsePostBody } from '@/utils/parseQuery'

import { prisma } from '../../../../prisma'
import { searchSchema } from '../../../validations/search'

const searchData = async (input: z.infer<typeof searchSchema>) => {
  const { query, page, limit, searchOption } = input
  const offset = (page - 1) * limit

  try {
    // 构建资源类型搜索条件
    const categoryConditions: Prisma.ResourceWhereInput[] = []

    // 资源类型映射
    const resourceTypeMap: Record<string, string> = {
      anime: 'a',
      comic: 'c',
      game: 'g',
      novel: 'n'
    }

    // 根据选中的资源类型构建查询条件
    searchOption.selectedResourceType.forEach((type) => {
      const prefix = resourceTypeMap[type]
      if (prefix) {
        categoryConditions.push({
          db_id: { startsWith: prefix }
        })
      }
    })

    // 如果没有选择任何分类，则搜索所有分类
    const categoryCondition: Prisma.ResourceWhereInput = categoryConditions.length > 0
      ? { OR: categoryConditions }
      : {}

    // 构建语言筛选条件
    const languageCondition: Prisma.ResourceWhereInput =
      searchOption.selectedLanguage && searchOption.selectedLanguage !== 'all'
        ? { language: { has: searchOption.selectedLanguage } }
        : {}

    // 构建完结状态筛选条件
    const statusCondition: Prisma.ResourceWhereInput =
      searchOption.selectedStatus && searchOption.selectedStatus !== 'all'
        ? { status: parseInt(searchOption.selectedStatus, 10) }
        : {}

    // 构建内容搜索条件 - 对每个关键词构建搜索条件
    const keywordSearchConditions: Prisma.ResourceWhereInput[] = query.map((keyword) => {
      const fieldConditions: Prisma.ResourceWhereInput[] = [
        { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } }
      ]

      //添加db_id搜索条件
      fieldConditions.push({
        db_id: { contains: keyword, mode: Prisma.QueryMode.insensitive }
      })

      // 动态添加简介搜索条件
      if (searchOption.searchInIntroduction) {
        fieldConditions.push({
          introduction: { contains: keyword, mode: Prisma.QueryMode.insensitive }
        })
      }

      // 动态添加别名搜索条件
      if (searchOption.searchInAlias) {
        fieldConditions.push({
          aliases: {
            some: {
              name: { contains: keyword, mode: Prisma.QueryMode.insensitive }
            }
          }
        })
      }

      // 对于每个关键词，使用OR连接不同字段的搜索条件
      return { OR: fieldConditions }
    })

    // 所有关键词必须都匹配（AND关系）
    const contentSearchCondition: Prisma.ResourceWhereInput = {
      AND: keywordSearchConditions
    }

    // 组合所有搜索条件
    const whereConditions: Prisma.ResourceWhereInput[] = []

    // 添加分类条件
    if (Object.keys(categoryCondition).length > 0) {
      whereConditions.push(categoryCondition)
    }

    // 添加语言条件
    if (Object.keys(languageCondition).length > 0) {
      whereConditions.push(languageCondition)
    }

    // 添加完结状态条件
    if (Object.keys(statusCondition).length > 0) {
      whereConditions.push(statusCondition)
    }

    // 添加内容搜索条件
    whereConditions.push(contentSearchCondition)

    const whereCondition: Prisma.ResourceWhereInput =
      whereConditions.length > 1
        ? { AND: whereConditions }
        : whereConditions[0] || {}

    // 构建排序条件
    let orderBy: any = {}

    // 处理关联计数排序
    if (searchOption.sortField === 'favorite_by') {
      orderBy = {
        favorite_folders: {
          _count: searchOption.sortOrder
        }
      }
    } else if (searchOption.sortField === 'comment') {
      orderBy = {
        comments: {
          _count: searchOption.sortOrder
        }
      }
    } else {
      // 普通字段排序
      orderBy[searchOption.sortField] = searchOption.sortOrder
    }

    // 获取搜索结果
    const data = await prisma.resource.findMany({
      where: whereCondition,
      select: {
        name: true,
        image_url: true,
        db_id: true,
        view: true,
        download: true,
        comment: true,
        status: true,
        _count: {
          select: {
            favorite_folders: true,
            comments: true
          }
        }
      },
      orderBy: orderBy,
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
        status: data.status,
        favorite_by: data._count.favorite_folders,
        comments: data._count.comments,
        _count: {
          favorite_by: data._count.favorite_folders,
          comment: data._count.comments
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
