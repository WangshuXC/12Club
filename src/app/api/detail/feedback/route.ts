import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { createMessage } from '@/utils/message'
import { ParsePostBody } from '@/utils/parseQuery'
import { getRouteByDbId } from '@/utils/router'
import { createResourceFeedbackSchema } from '@/validations/resource'

import { prisma } from '../../../../../prisma'

export const createFeedback = async (
  input: z.infer<typeof createResourceFeedbackSchema>,
  uid: number
) => {
  const resource = await prisma.resource.findUnique({
    where: { db_id: input.dbId }
  })
  const user = await prisma.user.findUnique({
    where: { id: uid }
  })

  const STATIC_CONTENT = `用户: ${user?.name} 对 资源: ${resource?.name} 提交了一个反馈\n\n${input.content}`

  await createMessage({
    type: 'feedback',
    content: STATIC_CONTENT,
    sender_id: uid,
    link: resource?.db_id ? getRouteByDbId(resource.db_id) : ''
  })

  return {}
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const result = createResourceFeedbackSchema.safeParse(body)
    
    // 如果验证失败，返回第一个错误的message
    if (!result.success) {
      const firstError = result.error.issues[0]

      return NextResponse.json(firstError.message)
    }
    
    const payload = await verifyHeaderCookie(req)
    if (!payload) {
      return NextResponse.json('用户未登录')
    }

    const response = await createFeedback(result.data, payload.uid)

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: '请求解析失败' }, { status: 400 })
  }
}
