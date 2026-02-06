import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { uploadResourceImage } from '@/app/api/edit/_upload'
import { verifyHeaderCookie } from '@/middleware/_verifyHeaderCookie'
import { ParseFormData } from '@/utils/parseQuery'
import { getRouteByDbId } from '@/utils/router'

import { prisma } from '../../../../../../prisma'

const updatePatchBannerSchema = z.object({
  resourceId: z.string(),
  image: z.any()
})

export const updatePatchBanner = async (
  image: ArrayBuffer,
  resourceId: string
) => {
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

  const payload = await verifyHeaderCookie(req)
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  if (payload.role < 3) {
    return NextResponse.json('本页面仅管理员可访问')
  }

  const image = await new Response(input.image)?.arrayBuffer()

  const response = await updatePatchBanner(image, input.resourceId)

  return NextResponse.json(response)
}
