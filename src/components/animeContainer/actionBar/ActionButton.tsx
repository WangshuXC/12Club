'use client'

import type { ReactNode } from 'react'

import { Button, Tooltip } from '@heroui/react'

import { cn } from '@/lib/utils'

interface ActionButtonProps {
  icon: ReactNode
  label?: string | number
  tooltip: string
  isActive?: boolean
  activeColor?: string
  onPress?: () => void
}

export const ActionButton = ({
  icon,
  label,
  tooltip,
  isActive = false,
  activeColor = 'text-danger-500',
  onPress
}: ActionButtonProps) => {
  return (
    <Tooltip content={tooltip}>
      <Button
        variant="light"
        size="lg"
        startContent={icon}
        className={cn(
          'text-default-600 hover:text-primary',
          isActive && activeColor
        )}
        onPress={onPress}
      >
        {label}
      </Button>
    </Tooltip>
  )
}
