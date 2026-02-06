'use client'

import { useState } from 'react'

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { BadgeCheck, Pencil, Shield } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'

import { Username, Bio, UserAvatar, Password } from './settings'

import type { UserInfo } from '@/types/api/user'

interface Props {
  user: UserInfo
}

export const SelfButton = ({ user }: Props) => {
  const router = useRouter()
  const isShowAdminButton = user.id === user.requestUserUid && user.role > 2

  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex-col w-full space-y-3">
      <div className="flex space-x-3">
        <Button
          startContent={<Pencil className="size-4 2xl:hidden 4xl:block" />}
          color="primary"
          variant="flat"
          fullWidth
          onPress={() => setIsOpen(true)}
        >
          编辑信息
        </Button>

        {isShowAdminButton && (
          <Button
            startContent={<Shield className="size-4 2xl:hidden 4xl:block" />}
            color="primary"
            variant="solid"
            fullWidth
            onPress={() => router.push('/admin')}
          >
            管理面板
          </Button>
        )}
      </div>

      {/* {user.role < 2 && (
        <Button
          startContent={<BadgeCheck className="size-4" />}
          color="primary"
          fullWidth
          onPress={() => router.push('/apply')}
        >
          申请成为创作者
        </Button>
      )} */}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="3xl" scrollBehavior="outside">
        <ModalContent>
          <ModalHeader>编辑信息</ModalHeader>
          <ModalBody>
            <UserAvatar />
            <Username />
            <Bio />
            <Password />
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
