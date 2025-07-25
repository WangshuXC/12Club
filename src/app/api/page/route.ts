import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery } from '@/utils/parseQuery'
import { pageSchema } from '../../../validations/page'
import {
  ALL_SUPPORTED_LANGUAGE,
  ALL_SUPPORTED_TYPE
} from '@/constants/resource'
import { prisma } from '../../../../prisma'

const getPageData = async (input: z.infer<typeof pageSchema>) => {
  const {
    selectedType = 'all',
    selectedLanguage = 'all',
    sortField,
    sortOrder,
    page,
    limit
  } = input

  // 构建过滤条件
  const whereConditions: any = {}
  
  // 语言过滤 - 检查language数组是否包含指定语言
  if (selectedLanguage !== 'all') {
    whereConditions.language = {
      has: selectedLanguage
    }
  }
  
  // 类型过滤 - 如果需要的话可以添加
  // if (selectedType !== 'all') {
  //   whereConditions.type = {
  //     has: selectedType
  //   }
  // }

  try {
    // 获取总数
    const count = await prisma.resource.count({
      where: whereConditions
    })

    // 计算分页偏移量
    const offset = (page - 1) * limit

    // 构建排序条件
    const orderBy: any = {}
    orderBy[sortField] = sortOrder

    // 获取分页数据
    const data = await prisma.resource.findMany({
      where: whereConditions,
      select: {
        name: true,
        image_url: true,
        db_id: true,
        view: true,
        download: true,
        comment: true
      },
      orderBy: orderBy,
      skip: offset,
      take: limit
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
    console.error('Error fetching page data:', error)
    throw error
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const input = ParseGetQuery(req, pageSchema)
    if (typeof input === 'string') {
      return NextResponse.json(input)
    }
    if (
      !ALL_SUPPORTED_TYPE.includes(input.selectedType) ||
      !ALL_SUPPORTED_LANGUAGE.includes(input.selectedLanguage)
    ) {
      return NextResponse.json('请选择我们支持的排序类型')
    }

    const response = await getPageData(input)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in page API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    )
  }
}
