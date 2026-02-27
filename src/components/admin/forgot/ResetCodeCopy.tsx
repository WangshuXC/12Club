'use client'

import { Button } from '@heroui/react'
import { addToast } from '@heroui/react'
import { Copy } from 'lucide-react'

interface ResetCodeCopyProps {
  resetCode: string
}

export const ResetCodeCopy = ({ resetCode }: ResetCodeCopyProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(resetCode)
    addToast({
      title: '成功',
      description: '重置码已复制到剪贴板',
      color: 'success'
    })
  }

  return (
    <Button isIconOnly size="sm" variant="light" onPress={handleCopy}>
      <Copy className="w-4 h-4" />
    </Button>
  )
}
