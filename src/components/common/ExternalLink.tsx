'use client'

import type { ReactNode } from 'react'

import { Link } from '@heroui/react'

import type { LinkProps } from '@heroui/react'

interface Props extends LinkProps {
  link: string
  children?: ReactNode
  showAnchorIcon?: boolean
}

// 确保链接包含协议前缀的辅助函数
const ensureProtocol = (url: string): string => {
  // 如果已经包含协议，直接返回
  if (url.match(/^https?:\/\//)) {
    return url
  }

  return `//${url}`
}

export const ExternalLink = ({
  link,
  children,
  showAnchorIcon = true,
  ...props
}: Props) => {
  return (
    <Link
      showAnchorIcon={showAnchorIcon}
      href={ensureProtocol(link)}
      aria-label="外部链接"
      target="_blank"
      {...props}
    >
      {children}
    </Link>
  )
}
