import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { uploadResourceImage } from '@/app/api/edit/upload'
import { prisma } from '@/lib/prisma'
import { withAdminAuth } from '@/lib/withAdminAuth'
import { ParseFormData } from '@/utils/parseQuery'
import { getRouteByDbId } from '@/utils/router'

const updatePatchBannerSchema = z.object({
  resourceId: z.string(),
  image: z.any()
})

const updatePatchBanner = async (image: ArrayBuffer, resourceId: string) => {
  const resource = await prisma.resource.findUnique({
    where: { id: Number(resourceId) }
  })
  if (!resource) {
    return '这个资源不存在'
  }

  const res = await uploadResourceImage(image, resource.db_id)
  if (typeof res === 'string') {
    return res
  }

  // 更新资源的图片链接
  const imageLink = `${process.env.IMAGE_BED_URL}/resource${getRouteByDbId(resource.db_id)}/banner.avif`
  await prisma.resource.update({
    where: { db_id: resource.db_id },
    data: { image_url: imageLink }
  })

  return { status: 200 }
}

export const POST = async (req: NextRequest) => {
  const input = await ParseFormData(req, updatePatchBannerSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return withAdminAuth(req, async (_payload) => {
    const image = await new Response(input.image)?.arrayBuffer()

    const response = await updatePatchBanner(image, input.resourceId)

    return NextResponse.json(response)
  })
}
