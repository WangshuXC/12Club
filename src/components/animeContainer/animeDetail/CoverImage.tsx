'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CoverImageProps {
  src: string
  alt?: string
  className?: string
}

export const CoverImage = ({
  src,
  alt = 'cover',
  className = ''
}: CoverImageProps) => {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className={`shrink-0 relative w-[165px] h-[221px] rounded-lg overflow-hidden shadow-md ${className}`}
    >
      <Image
        src={imageError ? '/no-pic.jpg' : src}
        onError={() => setImageError(true)}
        alt={alt}
        className="object-cover"
        fill
      />
    </div>
  )
}
