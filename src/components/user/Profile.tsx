'use client'

import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider
} from '@heroui/react'
import { Calendar, Link as LinkIcon } from 'lucide-react'

import { Config } from '@/config/config'
import { USER_ROLE_MAP } from '@/constants/user'
import { formatDistanceToNow } from '@/utils/formatDistanceToNow'

import { SelfButton } from './SelfButton'

import type { UserInfo } from '@/types/api/user'

export const UserProfile = ({ user }: { user: UserInfo }) => {
  return (
    <div className="2xl:col-span-1">
      <Card className="w-full">
        <CardHeader className="justify-center pt-8">
          <div className="flex flex-col items-center gap-3">
            <Avatar
              src={user.avatar}
              className="w-32 h-32"
              isBordered
              color="primary"
            />
            <div className="flex flex-col items-center gap-1">
              <h4 className="text-2xl font-bold">{user.name}</h4>
              <Chip color="primary" variant="flat" size="sm" className="mt-1">
                {USER_ROLE_MAP[user.role]}
              </Chip>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          {user.bio && (
            <p className="mb-6 text-center text-default-600">{user.bio}</p>
          )}
          <div className="flex flex-col justify-start gap-4">
            <div className="flex justify-start items-center gap-2">
              <LinkIcon className="size-4 text-default-400" />
              <a
                href={`${Config.url}/user/${user.id}`}
                className="text-small text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${Config.url}/user/${user.id}`}
              </a>
            </div>
            <div className="flex justify-start items-center gap-2">
              <Calendar className="size-4 text-default-400" />
              <span className="text-small text-default-500">
                加入于 {formatDistanceToNow(user.registerTime)}
              </span>
            </div>
          </div>
          <Divider className="my-4" />
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <SelfButton user={user} />
              {/* {user.id === user.requestUserUid ? (
                <SelfButton user={user} />
              ) : (
                <UserFollow
                  uid={user.id}
                  name={user.name}
                  follow={user.isFollow}
                />
              )} */}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
