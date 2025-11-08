import { prisma } from '../../../../../prisma'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

export const getResetCodes = async (params: {
  page: number
  limit: number
  search?: string
}) => {
  try {
    // 验证管理员权限
    const payload = await verifyHeaderCookie()
    if (!payload || payload.role < 3) {
      return '权限不足'
    }

    const { page, limit, search } = params
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { reset_code: { contains: search } }
      ]
    }

    // 获取重置码列表
    const [resetCodes, total] = await Promise.all([
      prisma.passwordReset.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              status: true
            }
          }
        },
        orderBy: { created: 'desc' },
        skip,
        take: limit
      }),
      prisma.passwordReset.count({ where })
    ])


    return {
      resetCodes: resetCodes.map(reset => ({
        id: reset.id,
        resetCode: reset.reset_code,
        userName: reset.name,
        userEmail: reset.email,
        userId: reset.user_id,
        user: reset.user,
        createdAt: reset.created.toISOString(),
        status: reset.status
      })),
      total,
      stats: {
        total
      }
    }
  } catch (error) {
    console.error('Get reset codes error:', error)
    return '获取重置码列表失败'
  }
}
