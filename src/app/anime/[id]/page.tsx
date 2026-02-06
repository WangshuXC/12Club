import { headers } from 'next/headers'

import { AnimeContainer } from '@/components/animeContainer'
import { ErrorComponent } from '@/components/common/Error'
import { DetailContainer } from '@/components/detailContainer'
import { Config } from '@/config/config'
import { getServerDeviceInfo } from '@/utils/device'

import { getResourceActions } from './actions'

import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const resource = await getResourceActions({ id })

  if (typeof resource === 'string') {
    return {
      title: '动漫详情',
      description: '动漫资源详情页'
    }
  }

  const { coverData, introduce } = resource
  const title = coverData.title
  const description =
    introduce.text?.slice(0, 160) ||
    `${title} - 在 12Club 观看和下载此动漫资源`

  return {
    title,
    description,
    keywords: [title, ...introduce.alias, ...introduce.tags.map((t) => t.name)],
    openGraph: {
      title: `${title} | ${Config.titleShort}`,
      description,
      type: 'video.other',
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

  const { introduce, coverData, series } = resource

  // 获取 user-agent 判断设备类型
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const deviceInfo = getServerDeviceInfo(userAgent)

  // 判断是否有播放链接，并且是PC设备，才使用AnimeContainer
  const hasPlayList = introduce?.playList && introduce.playList.length > 0
  const useAnimeLayout = hasPlayList && deviceInfo.isDesktop

  if (useAnimeLayout) {
    // 有播放链接且是PC设备时使用AnimeContainer（B站风格布局）
    return <AnimeContainer id={id} introduce={introduce} coverData={coverData} series={series} />
  } else {
    // 无播放链接或移动设备时使用原有的DetailContainer布局
    return (
      <div className="container py-6 mx-auto space-y-6">
        <DetailContainer id={id} introduce={introduce} coverData={coverData} />
      </div>
    )
  }
}
