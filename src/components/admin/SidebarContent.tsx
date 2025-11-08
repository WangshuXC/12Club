'use client'

import Link from 'next/link'
import {
  BadgeCheck,
  Edit,
  FileClock,
  MessageSquare,
  Puzzle,
  Settings,
  Users,
  MessageCircleQuestion,
  TriangleAlert,
  Images,
  Key,
  Megaphone,
  RefreshCw
} from 'lucide-react'
import { ComponentType } from 'react'

interface NotificationCardsProps {
  passwordResets: number
  feedbacks: number
  reports: number
  total: number
}

interface MenuItem {
  name: string
  href: string
  icon: ComponentType<{ size: number }> // 图标组件的类型
  notificationKey?: keyof NotificationCardsProps // 关联到通知计数的 key
}

const menuItems: MenuItem[] = [
  {
    name: '发布资源',
    href: '/admin/edit',
    icon: Edit
  },
  {
    name: '用户管理',
    href: '/admin/user',
    icon: Users
  },
  //   {
  //     name: '创作者管理',
  //     href: '/admin/creator',
  //     icon: BadgeCheck
  //   },
  {
    name: '资源管理',
    href: '/admin/resource',
    icon: Images
  },
  {
    name: '评论管理',
    href: '/admin/comment',
    icon: MessageSquare
  },
  {
    name: '公告管理',
    href: '/admin/announcement',
    icon: Megaphone
  },
  {
    name: '密码管理',
    href: '/admin/forgot',
    icon: Key,
    notificationKey: 'passwordResets'
  },
  {
    name: '资源反馈管理',
    href: '/admin/feedback',
    icon: MessageCircleQuestion,
    notificationKey: 'feedbacks'
  },
  {
    name: '评论举报管理',
    href: '/admin/report',
    icon: TriangleAlert,
    notificationKey: 'reports'
  },
  {
    name: '一键更新管理',
    href: '/admin/auto-update',
    icon: RefreshCw
  },
  //   {
  //     name: '管理日志',
  //     href: '/admin/log',
  //     icon: FileClock
  //   },
  //   {
  //     name: '网站设置',
  //     href: '/admin/setting',
  //     icon: Settings
  //   }
]

export const SidebarContent = ({ pathname, notifications }: { pathname: string, notifications: NotificationCardsProps }) => {
  return (
    <nav className="flex-1 p-4 pl-0">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          const notification = notifications || {passwordResets: 0, feedbacks: 0, reports: 0, total: 0}

          const count = item.notificationKey ? notification[item.notificationKey] : 0

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center justify-between gap-3 rounded-medium px-4 py-2 transition-colors ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-default-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.name}</span>
                </div>

                {count > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
