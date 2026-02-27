import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { ParsePostBody } from '@/utils/parseQuery'

import { prisma } from '../../../../../prisma'

const resourceIdSchema = z.object({
  resourceDbId: z.coerce.string().min(7).max(7)
})

export const updateView = async (input: z.infer<typeof resourceIdSchema>) => {
  const resource = await prisma.resource.findUnique({
    where: { db_id: input.resourceDbId }
  })
  if (!resource) {
    return '资源不存在'
  }

  await prisma.resource.update({
    where: { id: resource.id },
    data: { view: resource.view + 1, updated: resource.updated }
  })
  return {}
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, resourceIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await updateView(input)

  return NextResponse.json(response)
}
