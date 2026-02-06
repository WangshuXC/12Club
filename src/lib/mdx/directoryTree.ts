import fs from 'fs'
import path from 'path'

import matter from 'gray-matter'

import { docDirectoryLabelMap } from '@/constants/doc'

import type { TreeNode } from './types'

const POSTS_PATH = path.join(process.cwd(), 'posts')

export const getDirectoryTree = (): TreeNode => {
  const buildTree = (
    currentPath: string,
    baseName: string
  ): TreeNode | null => {
    const normalizedPath = path.resolve(__dirname, currentPath)
    const stats = fs.statSync(normalizedPath)

    if (stats.isFile() && normalizedPath.endsWith('.mdx')) {
      const fileContents = fs.readFileSync(normalizedPath, 'utf8')
      const { data } = matter(fileContents)

      return {
        name: baseName.replace(/\.mdx$/, ''),
        label: data.title,
        path: path
          .relative(POSTS_PATH, normalizedPath)
          .replace(/\.mdx$/, '')
          .replace(/\\/g, '/'),
        type: 'file'
      }
    }

    if (stats.isDirectory()) {
      const children = fs
        .readdirSync(normalizedPath)
        .map((child) => buildTree(path.join(normalizedPath, child), child))
        .filter((child): child is TreeNode => child !== null)

      return {
        name: baseName,
        label: docDirectoryLabelMap[baseName],
        path: path.relative(POSTS_PATH, normalizedPath).replace(/\\/g, '/'),
        children,
        type: 'directory'
      }
    }

    return null
  }

  return buildTree(POSTS_PATH, 'doc') as TreeNode
}
