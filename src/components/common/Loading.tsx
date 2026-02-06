import { Spinner } from '@heroui/spinner'
import Image from 'next/image'

import { cn } from '@/lib/utils'

interface Props {
  hint: string
  className?: string
}

export const Loading = ({ hint, className }: Props) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2 size-full',
        className
      )}
    >
      <Image
        className="rounded-2xl"
        src="/loading.gif"
        alt={hint}
        width={150}
        height={150}
        priority
      />
      <Spinner color="primary" size="lg" />
      <span>{hint}</span>
    </div>
  )
}
