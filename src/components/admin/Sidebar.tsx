'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Link
} from '@heroui/react'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { SidebarContent } from './SidebarContent'
import { useEffect } from 'react'

interface NotificationCardsProps {
  passwordResets: number
  feedbacks: number
  reports: number
  total: number
}

export const Sidebar = ({ notifications }: { notifications: NotificationCardsProps }) => {
  const pathname = usePathname()
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  useEffect(() => onClose(), [pathname])

  return (
    <>
      <aside className="fixed z-20 hidden w-64 h-full border-r 2xl:block 2xl:static bg-background border-divider">
        <div className="flex flex-col size-full">
          <Link
            color="foreground"
            href="/admin"
            className="my-4 text-xl font-bold"
          >
            管理面板
          </Link>
          {SidebarContent({ pathname, notifications })}
        </div>
      </aside>

      <div
        className="fixed top-0 left-0 flex items-center h-full cursor-pointer text-default-500 xl:hidden"
        onClick={() => onOpen()}
      >
        <ChevronRight size={24} />
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="left"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader className="flex flex-col gap-1">管理面板</DrawerHeader>
          <DrawerBody>{SidebarContent({ pathname, notifications })}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
