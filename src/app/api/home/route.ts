import { NextRequest, NextResponse } from 'next/server'

import { Announcement } from '@/types/api/announcement'
import { ResourceData } from '@/types/api/resource'
import { HomeCarousel, HomeComments } from '@/types/common/home'
import { getRouteByDbId } from '@/utils/router'

import { prisma } from '../../../../prisma'

const reorderByCentralPriority = (sortedArray: any[]) => {
  if (sortedArray.length === 0) return []

  const reordered = []
  const centerIndex = Math.floor((sortedArray.length - 1) / 2)
  reordered[centerIndex] = sortedArray[0]

  let left = centerIndex - 1
  let right = centerIndex + 1
  let isLeftTurn = true

  for (let i = 1; i < sortedArray.length; i++) {
    if (isLeftTurn) {
      reordered[left--] = sortedArray[i]
    } else {
      reordered[right++] = sortedArray[i]
    }

    isLeftTurn = !isLeftTurn
  }

  return reordered.filter((item) => item !== undefined)
}

export const getHomeData = async () => {
  // 获取轮播图数据 - 按浏览量降序排列，取前10条
  const carousel = await prisma.resource.findMany({
    where: {
      db_id: {
        startsWith: 'a'
      },
      created: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60)
      }
    },
    select: {
      name: true,
      image_url: true,
      db_id: true
    },
    orderBy: {
      view: 'desc'
    },
    take: 10
  })

  const reorderedData = reorderByCentralPriority(carousel || [])

  const carouselData: HomeCarousel[] = reorderedData.map((item) => ({
    title: item.name,
    imageSrc: item.image_url,
    href: getRouteByDbId(item.db_id)
  }))

  const announcements = await prisma.announcement.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      created: true,
      updated: true,
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    },
    orderBy: {
      created: 'desc'
    }
  })

  const announcementsData: Announcement[] = announcements.map(
    (announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      created: announcement.created,
      updated: announcement.updated,
      user: {
        id: announcement.user.id,
        name: announcement.user.name,
        avatar: announcement.user.avatar
      }
    })
  )

  // 获取评论数据 - 包含用户和资源信息，按创建时间降序排列，取前6条
  const comments = await prisma.resourceComment.findMany({
    select: {
      id: true,
      content: true,
      created: true,
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      resource: {
        select: {
          name: true,
          db_id: true
        }
      }
    },
    orderBy: {
      created: 'desc'
    },
    take: 6
  })

  const commentsData = (comments as unknown as HomeComments[]) || []

  // 获取资源数据 - 按创建时间升序排列，取前12条
  const data = await prisma.resource.findMany({
    where: {
      db_id: {
        startsWith: 'a'
      }
    },
    select: {
      name: true,
      image_url: true,
      db_id: true,
      view: true,
      download: true,
      comment: true,
      status: true,
      _count: {
        select: {
          favorite_folders: true,
          comments: true
        }
      }
    },
    orderBy: {
      created: 'desc'
    },
    take: 12
  })

  const updatedResourceData: ResourceData[] = data?.map((data) => {
    return {
      title: data.name,
      image: data.image_url,
      dbId: data.db_id,
      view: data.view,
      download: data.download,
      comment: data.comment,
      favorite_by: data._count.favorite_folders,
      comments: data._count.comments,
      status: data.status,
      _count: {
        favorite_by: data._count.favorite_folders,
        comment: data._count.comments
      }
    }
  })

  return {
    carouselData,
    commentsData,
    announcementsData,
    updatedResourceData
  }
}

export const GET = async (req: NextRequest) => {
  try {
    const response = await getHomeData()

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching home data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    )
  }
}
