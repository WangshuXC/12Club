'use client'

import { Button } from '@heroui/react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

interface IntroTextProps {
  text: string
  shouldShowExpand: boolean
  expanded: boolean
  onExpandChange: (expanded: boolean) => void
}

export const IntroText = ({
  text,
  shouldShowExpand,
  expanded,
  onExpandChange
}: IntroTextProps) => {
  // 处理文本中的 <br> 标签
  const formattedText = text.replace(/<br\s?\/?>/gi, '\n')

  return (
    <div className="text-sm text-default-600 leading-relaxed relative">
      <span className="text-default-400">简介：</span>
      <span
        className={cn(
          'whitespace-pre-line',
          !expanded && shouldShowExpand && 'line-clamp-5'
        )}
      >
        {formattedText || '暂无简介'}
      </span>
      {shouldShowExpand && (
        <span className="absolute right-0 bottom-0.5 flex items-center">
          <span className="w-12 h-5 bg-gradient-to-r from-transparent to-background -mr-1" />
          <Button
            size="sm"
            variant="light"
            color="primary"
            className="h-5 px-1 min-w-0 !bg-background hover:!bg-background"
            endContent={
              expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )
            }
            onPress={() => onExpandChange(!expanded)}
          >
            {expanded ? '收起' : '展开'}
          </Button>
        </span>
      )}
    </div>
  )
}
