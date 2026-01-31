import type { Metadata } from 'next'
import { DetailContainer } from '@/components/detailContainer'
import { getResourceActions } from './actions'
import { ErrorComponent } from '@/components/common/Error'
import { Config } from '@/config/config'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const resource = await getResourceActions({ id })

  if (typeof resource === 'string') {
    return {
      title: '漫画详情',
      description: '漫画资源详情页'
    }
  }

  const { coverData, introduce } = resource
  const title = coverData.title
  const description =
    introduce.text?.slice(0, 160) ||
    `${title} - 在 12Club 阅读和下载此漫画资源`

  return {
    title,
    description,
    keywords: [title, ...introduce.alias, ...introduce.tags.map((t) => t.name)],
    openGraph: {
      title: `${title} | ${Config.titleShort}`,
      description,
      type: 'book',
      images: coverData.image ? [{ url: coverData.image }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverData.image ? [coverData.image] : undefined
    }
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const resource = await getResourceActions({
    id
  })
  if (typeof resource === 'string') {
    return <ErrorComponent error={resource} />
  }

  const { introduce, coverData } = resource
  return (
    <div className="container py-6 mx-auto space-y-6">
      <DetailContainer id={id} introduce={introduce} coverData={coverData} />
    </div>
  )
}
