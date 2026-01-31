import type { Metadata } from 'next'
import { ErrorComponent } from '@/components/common/Error'
import { UserActivity } from '@/components/user/Activity'
import { UserStats } from '@/components/user/Status'
import { UserProfile } from '@/components/user/Profile'
import { getActions } from './actions'
import { Config } from '@/config/config'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (isNaN(Number(id))) {
    return {
      title: '用户主页',
      description: '用户个人主页'
    }
  }

  const user = await getActions(Number(id))
  if (!user || typeof user === 'string') {
    return {
      title: '用户不存在',
      description: '未找到该用户'
    }
  }

  const title = `${user.name} 的主页`
  const description =
    user.bio || `${user.name} 在 12Club 的个人主页，查看 TA 的动态和收藏`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${Config.titleShort}`,
      description,
      type: 'profile',
      images: user.avatar ? [{ url: user.avatar }] : undefined
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: user.avatar ? [user.avatar] : undefined
    }
  }
}

export default async function Layout({ params, children }: Props) {
  const { id } = await params
  if (isNaN(Number(id))) {
    return <ErrorComponent error={'提取页面参数错误'} />
  }

  const user = await getActions(Number(id))
  if (!user || typeof user === 'string') {
    return <ErrorComponent error={user} />
  }

  return (
    <div className="w-full py-8 mx-auto">
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <UserProfile user={user} />

        <div className="space-y-6 2xl:col-span-2">
          <UserStats user={user} />
          <UserActivity id={user.id} />
          {children}
        </div>
      </div>
    </div>
  )
}
