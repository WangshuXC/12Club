'use client'

import { useEffect } from 'react'

import {
  addToast,
  Button,
  NavbarContent,
  NavbarItem,
  Skeleton
} from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next-nprogress-bar'

import { useMounted } from '@/hooks/useMounted'
import { useMessageStore } from '@/store/messageStore'
import { useUserStore } from '@/store/userStore'
import { FetchGet } from '@/utils/fetch'

import { SearchButton } from './Search'
import { ThemeSwitcher } from './ThemeSwitcher'
import { UserDropdown } from './UserDropdown'
import { UserMessageBell } from './UserMessageBell'

import type { UserState } from '@/store/userStore'

export const TopBarUser = () => {
  const router = useRouter()
  const { user, setUser } = useUserStore((state) => state)
  const unread = useMessageStore((s) => s.unread)
  const fetchUnread = useMessageStore((s) => s.fetchUnread)
  const isMounted = useMounted()

  useEffect(() => {
    if (!isMounted) {
      return
    }

    if (!user.uid) {
      return
    }

    const getUserStatus = async () => {
      const res = await FetchGet<UserState>('/user/status')
      if (typeof res === 'string') {
        addToast({
          title: '错误',
          description: res,
          color: 'danger'
        })
        router.push('/login')
      } else {
        setUser(user)
        window?.umami?.identify(user.uid.toString(), {
          name: user.name,
          email: user.email
        })
      }
    }

    getUserStatus()
    fetchUnread()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, user.uid])

  return (
    <NavbarContent as="div" className="items-center" justify="end">
      {isMounted ? (
        <>
          {!user.name && (
            <NavbarContent justify="end">
              <NavbarItem className="hidden lg:flex">
                <Link href="/login">登录</Link>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={Link}
                  color="primary"
                  href="/register"
                  variant="flat"
                  className="hidden sm:flex"
                >
                  注册
                </Button>
              </NavbarItem>
              <NavbarItem className="flex lg:hidden">
                <Button as={Link} color="primary" href="/login" variant="flat">
                  登录
                </Button>
              </NavbarItem>
            </NavbarContent>
          )}

          <SearchButton />

          <ThemeSwitcher />

          {user.name && (
            <>
              <UserMessageBell
                hasUnreadMessages={unread.total > 0}
                setReadMessage={fetchUnread}
              />

              <UserDropdown />
            </>
          )}
        </>
      ) : (
        <Skeleton className="rounded-lg">
          <div className="w-32 h-10 bg-gray-300 rounded-lg" />
        </Skeleton>
      )}
    </NavbarContent>
  )
}
