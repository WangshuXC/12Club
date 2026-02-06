import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseGetQuery } from '@/utils/parseQuery'
import { getUserInfoSchema } from '@/validations/user'

import { prisma } from '../../../../../../prisma'

import type { UserResource } from '@/types/api/user'

export const getUserPatchResource = async (
  input: z.infer<typeof getUserInfoSchema>
) => {
  const { uid, page, limit } = input
  const offset = (page - 1) * limit

  const [data, total] = await Promise.all([
    prisma.resourcePatch.findMany({
      where: { user_id: uid },
      include: {
        resource: true
      },
      orderBy: { created: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.resourcePatch.count({
      where: { user_id: uid }
    })
  ])

  const resources: UserResource[] = data.map((res) => ({
    id: res.id,
    patchUniqueId: res.resource.db_id,
    patchId: res.id,
    patchName: res.name,
    patchBanner: res.resource.image_url,
    size: res.size,
    type: res.resource.type,
    language: res.language,
    platform: [], // ResourcePatch模型中没有platform字段，设为空数组
    created: String(res.created),
    content: res.content
  }))

  return { resources, total }
}

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, getUserInfoSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户登陆失效')
  }

  const response = await getUserPatchResource(input)

  return NextResponse.json(response)
}
