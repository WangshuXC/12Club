import { NextRequest, NextResponse } from 'next/server'

import {
  ALL_SUPPORTED_LANGUAGE,
  ALL_SUPPORTED_STATUS,
  ALL_SUPPORTED_TYPE
} from '@/constants/resource'
import { ParseGetQuery } from '@/utils/parseQuery'

import { pageSchema } from '../../../validations/page'

import { getPageData } from './get'

export const GET = async (req: NextRequest) => {
  try {
    const input = ParseGetQuery(req, pageSchema)
    if (typeof input === 'string') {
      return NextResponse.json(input)
    }

    if (
      !ALL_SUPPORTED_TYPE.includes(input.selectedType) ||
      !ALL_SUPPORTED_LANGUAGE.includes(input.selectedLanguage) ||
      !ALL_SUPPORTED_STATUS.includes(input.selectedStatus)
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
