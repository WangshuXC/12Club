'use client'

import { Chip, Button, Code } from '@heroui/react'
import { Copy, Trash2, Eye } from 'lucide-react'
import { addToast } from '@heroui/react'
import { ResetCodeCopy } from './ResetCodeCopy'
import { ResetCodeDelete } from './ResetCodeDelete'
import { ResetCodeDetail } from './ResetCodeDetail'
import { SelfUser } from '@/components/common/user-card/User'
import type { ResetCode } from '@/types/api/admin/forgot'
import { ResetCodeHandler } from '@/components/admin/forgot/ResetCodeHandler'

export const RenderCell = (
  resetCode: ResetCode,
  columnKey: string,
  onDelete?: (resetCodeId: number) => void,
  onUpdate?: (resetCodeId: number) => void
) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  switch (columnKey) {
    case 'user':
      return (
        <SelfUser
          user={resetCode.user}
          userProps={{
            name: resetCode.userName,
            description: resetCode.userEmail,
            avatarProps: {
              src: resetCode.user.avatar
            }
          }}
        />
      )

    case 'resetCode':
      return (
        <div className="flex items-center gap-2">
          <Code className="text-sm bg-default-100 px-2 py-1 rounded max-w-32 truncate">
            {resetCode.resetCode}
          </Code>
          <ResetCodeCopy resetCode={resetCode.resetCode} />
        </div>
      )

    case 'status':
      return (
        <div className="flex items-center gap-2">
          <Chip color={resetCode.status ? 'success' : 'danger'} variant="flat">
            {resetCode.status ? '已处理' : '未处理'}
          </Chip>
        </div>
      )

    case 'createdAt':
      return (
        <div className="text-sm text-default-500">
          {formatDate(resetCode.createdAt)}
        </div>
      )

    case 'actions':
      return (
        <div className="flex items-center gap-2">
          <ResetCodeDetail resetCode={resetCode} />
          <ResetCodeDelete resetCode={resetCode} onDelete={onDelete} />
          <ResetCodeHandler resetCode={resetCode} onUpdate={onUpdate} />
        </div>
      )

    default:
      return null
  }
}
