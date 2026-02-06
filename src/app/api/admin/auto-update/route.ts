import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { ParseGetQuery, ParsePostBody, ParseDeleteQuery } from '@/utils/parseQuery'
import { adminPaginationSchema } from '@/validations/admin'

import { prisma } from '../../../../../prisma'

import { getAutoUpdateResources } from './get'

// GET - 获取自动更新资源列表
export async function GET(req: NextRequest) {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ error: '用户登录失效' }, { status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json(
      { error: '本页面仅管理员可访问' },
      { status: 403 }
    )
  }

  const query = ParseGetQuery(req, adminPaginationSchema)
  if (typeof query === 'string') {
    return NextResponse.json({ error: query }, { status: 400 })
  }

  const response = await getAutoUpdateResources(query)
  if (typeof response === 'string') {
    return NextResponse.json({ error: response }, { status: 500 })
  }

  return NextResponse.json(response)
}

// POST - 添加资源到自动更新列表
const addAutoUpdateSchema = z.object({
  resourceId: z.number()
})

export async function POST(req: NextRequest) {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ error: '用户登录失效' }, { status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json(
      { error: '本页面仅管理员可访问' },
      { status: 403 }
    )
  }

  const body = await ParsePostBody(req, addAutoUpdateSchema)
  if (typeof body === 'string') {
    return NextResponse.json({ error: body }, { status: 400 })
  }

  try {
    // 检查资源是否存在
    const resource = await prisma.resource.findUnique({
      where: { id: body.resourceId }
    })

    if (!resource) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 })
    }

    // 检查是否已存在
    const existing = await prisma.resourceAutoUpdate.findUnique({
      where: { resource_id: body.resourceId }
    })

    if (existing) {
      return NextResponse.json({ error: '该资源已在自动更新列表中' }, { status: 400 })
    }

    // 创建自动更新记录
    const autoUpdate = await prisma.resourceAutoUpdate.create({
      data: {
        resource_id: body.resourceId,
        user_id: payload.uid,
        status: 1
      }
    })

    return NextResponse.json({
      success: true,
      message: '添加成功',
      data: autoUpdate
    })
  } catch (error) {
    console.error('添加自动更新资源失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加失败' },
      { status: 500 }
    )
  }
}

// DELETE - 从自动更新列表移除资源
const deleteAutoUpdateSchema = z.object({
  id: z.string().transform(Number)
})

export async function DELETE(req: NextRequest) {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json({ error: '用户登录失效' }, { status: 401 })
  }

  if (payload.role < 3) {
    return NextResponse.json(
      { error: '本页面仅管理员可访问' },
      { status: 403 }
    )
  }

  const query = ParseDeleteQuery(req, deleteAutoUpdateSchema)
  if (typeof query === 'string') {
    return NextResponse.json({ error: query }, { status: 400 })
  }

  try {
    await prisma.resourceAutoUpdate.delete({
      where: { id: query.id }
    })

    return NextResponse.json({
      success: true,
      message: '移除成功'
    })
  } catch (error) {
    console.error('移除自动更新资源失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '移除失败' },
      { status: 500 }
    )
  }
}

