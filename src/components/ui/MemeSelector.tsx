'use client'

import { useState } from 'react'

import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow } from '@heroui/react'
import { Smile } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getMemeList, type MemeItem } from '@/utils/memeUtils'

interface MemeSelectorProps {
    onMemeSelect: (meme: MemeItem) => void
    isDisabled?: boolean
    className?: string
}

export const MemeSelector = ({
  onMemeSelect,
  isDisabled = false,
  className
}: MemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const memeList = getMemeList()

  const handleMemeClick = (meme: MemeItem) => {
    onMemeSelect(meme)
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          size="sm"
          isDisabled={isDisabled}
          className={cn('min-w-8 w-8 h-8', className)}
          aria-label="选择表情"
        >
          <Smile className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 max-w-[calc(100vw-2rem)]">
        <div className="w-full max-w-80 min-w-48">
          <div className="text-sm font-medium mb-2 px-1">选择表情</div>
          <ScrollShadow hideScrollBar className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 p-1 overflow-y-auto">
            {memeList.map((meme) => (
              <button
                key={meme.name}
                onClick={() => handleMemeClick(meme)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden',
                  'border-2 border-transparent hover:border-primary',
                  'transition-all duration-200 hover:scale-105',
                  'focus:outline-none focus:border-primary focus:scale-105'
                )}
                title={meme.displayName}
              >
                <img
                  src={meme.path}
                  alt={meme.displayName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </ScrollShadow>
        </div>
      </PopoverContent>
    </Popover>
  )
} 