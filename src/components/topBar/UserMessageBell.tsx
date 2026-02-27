'use client'

import { Button, Tooltip } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BellRing } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'

interface AnimatedNotificationBellProps {
  hasUnreadMessages: boolean
  setReadMessage: () => void
}

export const UserMessageBell = ({
  hasUnreadMessages,
  setReadMessage
}: AnimatedNotificationBellProps) => {
  const router = useRouter()

  const handleClickButton = () => {
    router.push('/message/notice')

    if (hasUnreadMessages) {
      setReadMessage()
    }
  }

  return (
    <Tooltip
      disableAnimation
      showArrow
      closeDelay={0}
      content={hasUnreadMessages ? '您有新消息!' : '我的消息'}
    >
      <Button
        isIconOnly
        variant="light"
        onPress={handleClickButton}
        className="relative"
        aria-label="我的消息"
      >
        <motion.div
          initial="initial"
          animate={hasUnreadMessages ? 'animate' : 'initial'}
          whileHover="hover"
          variants={{
            initial: { rotate: 0 },
            animate: {
              rotate: [0, -10, 10, -10, 10, 0],
              transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }
            }
          }}
        >
          {hasUnreadMessages ? (
            <BellRing className="size-6 text-primary" />
          ) : (
            <Bell className="size-6 text-default-500" />
          )}
        </motion.div>

        <AnimatePresence>
          {hasUnreadMessages && (
            <motion.div
              className="absolute rounded-full bottom-1 right-1 size-2 bg-danger"
              variants={{
                initial: { scale: 0, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0, opacity: 0 }
              }}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          )}
        </AnimatePresence>
      </Button>
    </Tooltip>
  )
}
