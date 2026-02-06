import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc'

import { docCode } from './element/code'
import { createHeading } from './element/heading'
import { docLink } from './element/link'
import { docTable } from './element/table'

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: docLink,
  code: docCode,
  Table: docTable
}

export const CustomMDX = (props: MDXRemoteProps) => {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) } as any}
    />
  )
}
