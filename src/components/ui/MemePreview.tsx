'use client'

import { CommentContent } from '@/components/ui/CommentContent'
import { cn } from '@/lib/utils'

interface CommentPreviewProps {
  text: string
  className?: string
}

export const CommentPreview = ({ text, className }: CommentPreviewProps) => {
  // 如果文本为空，不显示预览
  if (!text.trim()) {
    return null
  }

  return (
    <div className={cn('mt-2 p-3 bg-default-50 rounded-lg', className)}>
      <div className="text-xs text-foreground-500 mb-2">评论预览:</div>
      <div className="text-sm">
        <CommentContent content={text} isPreview={true} />
      </div>
    </div>
  )
}
