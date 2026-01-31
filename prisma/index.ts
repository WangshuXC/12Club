import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// 声明全局变量类型
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端的函数
const createPrismaClient = () => {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    })

    // 生产环境使用 Prisma Accelerate
    if (process.env.NODE_ENV === 'production') {
        return client.$extends(withAccelerate()) as unknown as PrismaClient
    }

    return client
}

// 确保在开发和生产环境都只创建一个实例
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 开发环境下缓存到全局变量，避免热重载时创建多个连接
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
