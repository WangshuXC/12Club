import { BlogHeader } from '@/components/doc/BlogHeader'
import { BottomNavigation } from '@/components/doc/Navigation'
import { TableOfContents } from '@/components/doc/TableOfContents'
import { CustomMDX } from '@/lib/mdx/CustomMDX'
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug
} from '@/lib/mdx/getPosts'

import { generateMetadataTemplate } from './metadata'

import type { Metadata } from 'next'

interface Props {
  params: Promise<{
    slug: string[]
  }>
}

export const generateStaticParams = async () => {
  const posts = getAllPosts()

  return posts.map((post) => ({
    slug: post.slug.split('/')
  }))
}

export const generateMetadata = async ({
  params
}: Props): Promise<Metadata> => {
  const { slug } = await params
  const url = slug.join('/')
  const blog = getPostBySlug(url)

  return generateMetadataTemplate(blog)
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const url = slug.join('/')
  const { content, frontmatter } = getPostBySlug(url)
  const { prev, next } = getAdjacentPosts(url)

  return (
    <div className="flex w-full">
      <div className="w-full 5xl:w-[calc(100%-16rem)] px-3 sm:px-6">
        <BlogHeader frontmatter={frontmatter} />
        <article className="doc-prose">
          <CustomMDX source={content} />
        </article>
        <BottomNavigation prev={prev} next={next} />
      </div>

      <div>
        <TableOfContents />
      </div>
    </div>
  )
}
