'use client'

import { useEffect, useState } from 'react'

import { Tab, Tabs } from '@heroui/react'
import { Bell, Film, MessageSquare } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next-nprogress-bar'

import { useMessageStore } from '@/store/messageStore'

import type { MessageCategory } from '@/types/api/message'

const TABS: Array<{
  category: MessageCategory
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { category: 'notice', label: '系统通知', href: '/message/notice', icon: Bell },
  { category: 'update', label: '番剧更新', href: '/message/update', icon: Film },
  {
    category: 'comment',
    label: '评论区',
    href: '/message/comment',
    icon: MessageSquare
  }
]

const TabTitle = ({
  Icon,
  label,
  count
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  count: number
}) => (
  <div className="flex items-center gap-2">
    <Icon className="size-4 shrink-0" />
    <span className="truncate">{label}</span>
    {count > 0 && (
      <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs text-white">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </div>
)

export const MessageSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const unread = useMessageStore((s) => s.unread)
  const [isVertical, setIsVertical] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsVertical(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  const handleChange = (key: React.Key) => {
    const target = TABS.find((t) => t.href === key)
    if (target && target.href !== pathname) {
      router.push(target.href)
    }
  }

  return (
    <div className={isVertical ? 'sticky top-20 w-full' : 'w-full'}>
      <Tabs
        aria-label="消息分类"
        isVertical={isVertical}
        fullWidth
        selectedKey={pathname}
        onSelectionChange={handleChange}
        classNames={{
          base: 'w-full',
          tabList: 'w-full',
          tab: isVertical ? 'justify-start h-10' : 'h-10'
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.href}
            title={
              <TabTitle
                Icon={tab.icon}
                label={tab.label}
                count={unread[tab.category]}
              />
            }
          />
        ))}
      </Tabs>
    </div>
  )
}
