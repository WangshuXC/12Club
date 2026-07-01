/**
 * Next.js instrumentation：服务端启动钩子。
 * 详见 https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export const register = async () => {
  // 仅 Node.js runtime 启动后台任务，Edge runtime 跳过
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { startViewCounterScheduler } = await import(
    '@/lib/viewCounterScheduler'
  )
  startViewCounterScheduler()
}
