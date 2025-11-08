'use client'

import { FC } from 'react'
import { BadgeAlert } from 'lucide-react'
import { Card, CardBody, CardFooter, Link } from '@heroui/react'

interface NotificationCardsProps {
  passwordResets: number
  feedbacks: number
  reports: number
  total: number
}

interface NotificationItem {
  key: string
  title: string
  description: string
  count: number
  href: string
}

const NotificationItemCard: FC<{ item: NotificationItem }> = ({ item }) => {
  return (
    <Card className="w-full">
      <CardBody className="flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-default-700">
            {item.title}
          </h4>
        </div>

        <p className="text-3xl font-bold text-primary-600">
          {item.count}
        </p>

        <p className="text-sm text-default-500">
          {item.description}
        </p>
      </CardBody>
      <CardFooter>
        <Link href={item.href} showAnchorIcon>
          前往处理
        </Link>
      </CardFooter>
    </Card>
  )
}

export const AdminNotification: FC<{ notifications: NotificationCardsProps }> = ({ notifications }) => {
  const notificationItems: NotificationItem[] = [
    {
      key: 'feedbacks',
      title: '用户反馈',
      description: '待处理的资源反馈',
      count: notifications.feedbacks,
      href: '/admin/feedback',
    },
    {
      key: 'reports',
      title: '举报内容',
      description: '待审核的用户举报内容',
      count: notifications.reports,
      href: '/admin/report',
    },
    {
      key: 'passwordResets',
      title: '密码重置',
      description: '待处理的密码重置请求',
      count: notifications.passwordResets,
      href: '/admin/forgot',
    },
  ]

  return (
    <div className="flex flex-col space-y-6">
      <h3 className="text-2xl font-bold whitespace-nowrap flex items-center gap-2">
        <BadgeAlert size={20} className="hidden 2xl:block" />
        通知
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 4xl:grid-cols-4 gap-4">
        {notificationItems.map((item) => (
          <NotificationItemCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  )
}