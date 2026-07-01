'use client'

import { Chip } from '@heroui/react'
import {
  AtSign,
  Bell,
  Film,
  Heart,
  Megaphone,
  MessageCircle,
  Star,
  UserCheck,
  UserPlus
} from 'lucide-react'

import { MESSAGE_TYPE_MAP } from '@/constants/message'

import type { Message } from '@/types/api/message'

interface Props {
  type: Message['type']
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  apply: UserPlus,
  system: Megaphone,
  pm: MessageCircle,
  like: Heart,
  favorite: Star,
  comment: MessageCircle,
  follow: UserCheck,
  pr: Bell,
  feedback: Bell,
  feedback_handle: Bell,
  report: Bell,
  report_handle: Bell,
  mention: AtSign,
  resource_update: Film
}

const COLOR_MAP: Record<
  string,
  'primary' | 'success' | 'warning' | 'danger' | 'default' | 'secondary'
> = {
  apply: 'primary',
  system: 'primary',
  pm: 'secondary',
  like: 'danger',
  favorite: 'warning',
  comment: 'success',
  follow: 'primary',
  pr: 'primary',
  feedback: 'default',
  feedback_handle: 'success',
  report: 'default',
  report_handle: 'success',
  mention: 'secondary',
  resource_update: 'primary'
}

export const CategoryBadge = ({ type }: Props) => {
  const label = MESSAGE_TYPE_MAP[type] || '消息'
  const Icon = ICON_MAP[type] ?? Bell
  const color = COLOR_MAP[type] ?? 'default'

  return (
    <Chip
      color={color}
      variant="flat"
      size="sm"
      startContent={<Icon className="ml-1 size-3" />}
    >
      {label}
    </Chip>
  )
}
