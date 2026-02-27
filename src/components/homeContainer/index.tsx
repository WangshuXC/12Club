'use client'
import { Button } from '@heroui/react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { Announcement } from '@/types/api/announcement'
import { ResourceData } from '@/types/api/resource'
import { HomeCarousel, HomeComments } from '@/types/common/home'

import { CoverCard } from '../common/CoverCard'

import AnimeCarousel from './AnimeCarousel'
import { AnnouncementCarousel } from './AnnouncementCarousel'
import CommentCard from './CommentCard'

interface Props {
  carouselData: HomeCarousel[]
  commentsData: HomeComments[]
  announcementsData: Announcement[]
  updatedResourceData: ResourceData[]
}

export const HomeContainer = ({
  carouselData,
  commentsData,
  announcementsData,
  updatedResourceData
}: Props) => {
  return (
    <div
      className={`
        w-screen h-fit overflow-hidden p-3 -mx-3 sm:-mx-6
        flex flex-col gap-3 justify-center items-center
      `}
    >
      <div className="w-full">
        <AnimeCarousel slides={carouselData} />
        <div className="divider w-full h-[60px]" />
      </div>

      <AnnouncementCarousel announcements={announcementsData} />

      <div className="container mx-auto my-4 space-y-6 7xl:px-12">
        {updatedResourceData?.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-bold sm:text-2xl">最新动画</h2>
              <Button
                variant="light"
                as={Link}
                color="primary"
                endContent={<ChevronRight className="size-4" />}
                href="/anime"
              >
                查看更多
              </Button>
            </div>
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-3 4xl:grid-cols-4">
              {updatedResourceData?.map((data) => (
                <CoverCard
                  key={data.dbId}
                  data={{
                    ...data,
                    comment: data._count.comment,
                    favorite_by: data._count.favorite_by
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {commentsData?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-lg font-bold sm:text-2xl">最新评论</h2>
            <div className="grid grid-cols-1 gap-2 lg:gap-6 2xl:grid-cols-2">
              {commentsData?.map((item) => (
                <CommentCard key={item.id} data={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
