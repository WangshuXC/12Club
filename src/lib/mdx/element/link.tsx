import React, { FC } from 'react'

import Link from 'next/link'

interface CustomLinkProps {
  href: string
  [key: string]: any
}

export const docLink: FC<CustomLinkProps> = ({ href, children, ...props }) => {
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <a target="_blank" rel="noopener noreferrer" href={href} {...props}>
      {children}
    </a>
  )
}
