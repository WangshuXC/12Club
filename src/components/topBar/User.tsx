'use client'

import { useEffect, useState } from 'react'

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
import { useUserStore } from '@/store/userStore'
import { FetchGet } from '@/utils/fetch'

import { SearchButton } from './Search'
import { ThemeSwitcher } from './ThemeSwitcher'
import { UserDropdown } from './UserDropdown'
import { UserMessageBell } from './UserMessageBell'

import type { UserState } from '@/store/userStore'
import type { Message } from '@/types/api/message'

export const TopBarUser = () => {
  const router = useRouter()
  const { user, setUser } = useUserStore((state) => state)
  const [hasUnread, setHasUnread] = useState(false)
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

    const getUserUnreadMessage = async () => {
      const message = await FetchGet<Message | null>('/message/unread')
      if (message) {
        setHasUnread(true)
      }
    }

    getUserStatus()

    // getUserUnreadMessage()
  }, [isMounted])

  return (
    <NavbarContent as="div" className="items-center" justify="end">
      {isMounted ? (
        <>
          {!user.name && (
            <NavbarContent justify="end">
              <NavbarItem className="hidden 2xl:flex">
                <Link href="/login">登录</Link>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={Link}
                  color="primary"
                  href="/register"
                  variant="flat"
                  className="hidden lg:flex"
                >
                  注册
                </Button>
              </NavbarItem>
              <NavbarItem className="flex 2xl:hidden">
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
              {/* <UserMessageBell
                hasUnreadMessages={hasUnread}
                setReadMessage={() => setHasUnread(false)}
              /> */}

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
