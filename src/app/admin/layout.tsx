import { Sidebar } from '@/components/admin/Sidebar'
import { NotFoundComponent } from '@/components/common/NotFound'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { getAdminNotification } from '@/app/api/admin/stats/notice/route'

export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
}

export default async function Layout({ children }: Props) {
  const payload = await verifyHeaderCookie()

  // 如果用户未登录或权限不足（role < 3），显示 404 页面
  if (!payload || payload.role < 3) {
    return <NotFoundComponent />
  }

  const notificationData = await getAdminNotification()

  return (
    <div className="container flex mx-auto my-4">
      <Sidebar notifications={notificationData} />
      <div className="flex w-full overflow-y-auto">
        <div className="w-full px-4">{children}</div>
      </div>
    </div>
  )
}
