/**
 * Next.js instrumentation：服务端启动钩子。
 * 仅在 Node.js runtime 加载依赖 Node 内置模块（stream/crypto/net...）的代码。
 * 使用静态字符串 + NEXT_RUNTIME 判断，让 webpack 能为 Edge bundle 静态剪除该分支，
 * 避免 ioredis 传递依赖在 Edge 打包时报 "Can't resolve 'stream/crypto/dns/net/tls'".
 * 详见 https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startViewCounterScheduler } = await import(
      './lib/viewCounterScheduler'
    )
    startViewCounterScheduler()
  }
}
