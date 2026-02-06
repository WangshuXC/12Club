import { MasonryGrid } from '@/components/common/MasonryGrid'
import { AboutCard } from '@/components/doc/Card'
import { AboutHeader } from '@/components/doc/Header'
import { getAllPosts } from '@/lib/mdx/getPosts'

import { clubMetadata } from './metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = clubMetadata

export default function DocPage() {
  const posts = getAllPosts()

  return (
    <div className="w-full px-6 pb-6">
      <AboutHeader />

      <div className="grid gap-4">
        <MasonryGrid columnWidth={300} gap={24}>
          {posts.map((post) => (
            <AboutCard key={post.slug} post={post} />
          ))}
        </MasonryGrid>
      </div>
    </div>
  )
}
