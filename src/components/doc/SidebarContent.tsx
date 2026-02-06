'use client'

import { TreeNode } from '@/lib/mdx/types'

import { TreeItem } from './SideTreeItem'

interface Props {
  tree: TreeNode
}

export const SidebarContent = ({ tree }: Props) => {
  return (
    <div>
      {tree.type === 'directory' &&
        tree.children?.map((child, index) => (
          <TreeItem key={index} node={child} level={0} />
        ))}
    </div>
  )
}
