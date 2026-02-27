'use client'

import { Tooltip, User, type UserProps } from '@heroui/react'
import { useRouter } from 'next-nprogress-bar'

import type { _User } from '@/types/user'

interface SelfUserProps {
  user: _User
  userProps: UserProps
}

export const SelfUser = ({ user, userProps }: SelfUserProps) => {
  const router = useRouter()

  const { avatarProps, ...restUser } = userProps
  const { alt, name, ...restAvatar } = avatarProps!
  const username = name?.charAt(0).toUpperCase() ?? '用户'
  const altString = alt ? alt : username

  return (
    // <Tooltip
    //   showArrow
    //   delay={500}
    //   closeDelay={200}
    //   //   content={<UserCard uid={user.id} />}
    //   classNames={{
    //     content: ['bg-background/70 backdrop-blur-md']
    //   }}
    // >

    // </Tooltip>
    <User
      {...restUser}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        router.push(`/user/${user.id}/resource`)
      }}
      avatarProps={{
        name: username,
        alt: altString,
        className:
          'transition-transform duration-200 cursor-pointer shrink-0 hover:scale-110',
        ...restAvatar
      }}
      className="cursor-pointer"
    />
  )
}
