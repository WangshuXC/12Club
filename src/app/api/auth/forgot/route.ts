import { NextRequest, NextResponse } from 'next/server'
import { ParsePostBody, ParsePutBody } from '@/utils/parseQuery'
import {
  forgotRequestSchema,
  updateResetCodeStatusSchema
} from '@/validations/auth'
import { requestPasswordReset } from './post'
import { getResetCodes } from './get'
import { deleteResetCode } from './delete'
import { updateResetCodeStatus } from './put'

// POST - 申请重置密码
export const POST = async (req: NextRequest) => {
  const input = await ParsePostBody(req, forgotRequestSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const response = await requestPasswordReset(input)
  return NextResponse.json(response)
}

// GET - 获取重置码列表（管理员功能）
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined

    const response = await getResetCodes({ page, limit, search })
    
    if (typeof response === 'string') {
      return NextResponse.json(
        {
          message: response,
          status: 403
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        message: '获取重置码列表成功',
        status: 200,
        data: response
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get reset codes error:', error)
    return NextResponse.json(
      {
        message: '服务器内部错误',
        status: 500
      },
      { status: 500 }
    )
  }
}

// DELETE - 删除重置码（管理员功能）
export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          message: '缺少重置码ID',
          status: 400
        },
        { status: 400 }
      )
    }

    const response = await deleteResetCode(parseInt(id))
    
    if (!response.success) {
      return NextResponse.json(
        {
          message: response.message,
          status: 403
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        message: response.message,
        status: 200
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete reset code error:', error)
    return NextResponse.json(
      {
        message: '服务器内部错误',
        status: 500
      },
      { status: 500 }
    )
  }
}

// PUT - 更新重置码状态（管理员功能）
export const PUT = async (req: NextRequest) => {
  try {
    const id = await ParsePutBody(req, updateResetCodeStatusSchema)

    if (!id || typeof id === 'string') {
      return NextResponse.json(
        {
          message: '缺少重置码ID',
          status: 400
        },
        { status: 400 }
      )
    }
    const response = await updateResetCodeStatus(id)

    if (!response.success) {
      return NextResponse.json(
        {
          message: response.message,
          status: 403
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        message: response.message,
        status: 200
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update reset code status error:', error)
    return NextResponse.json(
      {
        message: '服务器内部错误',
        status: 500
      },
      { status: 500 }
    )
  }
}