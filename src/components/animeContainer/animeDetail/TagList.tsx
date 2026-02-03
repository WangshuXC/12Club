'use client'

import { Chip } from '@heroui/react'

interface Tag {
  name: string
}

interface TagListProps {
  tags: Tag[]
  maxDisplay?: number
}

export const TagList = ({ tags, maxDisplay = 6 }: TagListProps) => {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {tags.slice(0, maxDisplay).map((tag) => (
        <Chip
          key={tag.name}
          size="sm"
          variant="flat"
          color="primary"
          className="text-xs h-5"
        >
          {tag.name}
        </Chip>
      ))}
      {tags.length > maxDisplay && (
        <Chip size="sm" variant="flat" color="default" className="text-xs h-5">
          +{tags.length - maxDisplay}
        </Chip>
      )}
    </div>
  )
}
