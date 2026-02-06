import { NextRequest, NextResponse } from 'next/server'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseFormData, ParsePutBody } from '@/utils/parseQuery'
import { resourceCreateSchema } from '@/validations/edit'

import { createResource } from './create'

const checkStringArrayValid = (type: 'alias' | 'tag', aliasString: string) => {
  const label = type === 'alias' ? '别名' : '标签'

  const aliasArray = JSON.parse(aliasString) as string[]
  if (aliasArray.length > 100) {
    return `您最多使用 100 个${label}`
  }

  const maxLength = aliasArray.some((alias) => alias.length > 500)
  if (maxLength) {
    return `单个${label}的长度不可超过 500 个字符`
  }

  const minLength = aliasArray.some((alias) => alias.trim().length === 0)
  if (minLength) {
    return `单个${label}至少一个字符`
  }

  return aliasArray.map((a) => a.trim())
}

export const POST = async (req: NextRequest) => {
  const input = await ParseFormData(req, resourceCreateSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const { alias, tag, banner, ...rest } = input
  const aliasResult = checkStringArrayValid('alias', alias)
  if (typeof aliasResult === 'string') {
    return NextResponse.json(aliasResult)
  }

  // 处理标签（如果存在）
  let tagResult: string[] = []
  if (tag) {
    const tagCheckResult = checkStringArrayValid('tag', tag)
    if (typeof tagCheckResult === 'string') {
      return NextResponse.json(tagCheckResult)
    }

    tagResult = tagCheckResult
  }

  const bannerArrayBuffer = await new Response(banner)?.arrayBuffer()

  const response = await createResource(
    { alias: aliasResult, tag: tagResult, banner: banner, ...rest },
    payload.uid
  )

  return NextResponse.json(response)
}
