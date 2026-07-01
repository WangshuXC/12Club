import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { ParsePostBody } from '@/utils/parseQuery'

const resourceIdSchema = z.object({
  resourceDbId: z.coerce.string().min(7).max(7)
})

const updateDownload = async (input: z.infer<typeof resourceIdSchema>) => {
  const resource = await prisma.resource.findUnique({
    where: { db_id: input.resourceDbId }
  })
  if (!resource) {
    return '资源不存在'
  }

  await prisma.resource.update({
    where: { id: resource.id },
    data: { download: resource.download + 1, updated: resource.updated }
  })
  return {}
}

export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, resourceIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await updateDownload(input)

  return NextResponse.json(response)
}
