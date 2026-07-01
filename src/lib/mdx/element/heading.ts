import { createElement, isValidElement, ReactNode } from 'react'

const getTextContent = (children: ReactNode): string => {
  if (typeof children === 'string') {
    return children
  }

  if (Array.isArray(children)) {
    return children.map((child) => getTextContent(child)).join('')
  }

  if (isValidElement(children)) {
    return getTextContent(
      (children.props as { children?: ReactNode })?.children
    )
  }

  if (children && typeof children === 'object' && 'props' in children) {
    return getTextContent((children.props as { children?: ReactNode }).children)
  }

  return ''
}

const slugify = (str: string): string => {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const createHeading = (level: number) => {
  const Heading = ({ children }: { children: ReactNode }) => {
    const text = getTextContent(children)
    const slug = slugify(text)

    return createElement(
      `h${level}`,
      { id: slug },
      [
        createElement('a', {
          href: `#${slug}`,
          key: `-link-${slug}`,
          className: '-anchor',
          'aria-label': slug
        })
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}
