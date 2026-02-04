import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery } from '@/utils/parseQuery'

import { getKv, setKv } from '@/lib/redis'

import {
  Introduction,
  Cover,
  PlayListItem
} from '@/types/common/detail-container'
import { prisma } from '../../../../prisma'
import { RESOURCE_CACHE_DURATION } from '@/config/cache'

const detailIdSchema = z.object({
  id: z.coerce.string().min(7).max(7),
  uid: z.coerce.number().optional()
})

const CACHE_KEY = 'resource'

const getDetailData = async (input: z.infer<typeof detailIdSchema>) => {
  const cachedResource = await getKv(`${CACHE_KEY}:${input.id}`)
  if (cachedResource) {
    return JSON.parse(cachedResource)
  }

  try {
    const detail = await prisma.resource.findUnique({
      where: { db_id: input.id },
      select: {
        id: true,
        introduction: true,
        created: true,
        updated: true,
        released: true,
        db_id: true,
        name: true,
        image_url: true,
        view: true,
        download: true,
        author: true,
        translator: true,
        aliases: {
          select: { name: true }
        },
        tag_relations: {
          select: {
            tag: {
              select: {
                name: true,
                count: true
              }
            }
          }
        },
        play_links: {
          select: {
            accordion: true,
            show_accordion: true,
            link: true,
          },
          orderBy: {
            accordion: 'asc'
          }
        },
        favorite_folders: {
          where: {
            folder: {
              user_id: input?.uid ?? 0
            }
          }
        },
        series_relations: {
          select: {
            series: {
              select: {
                id: true,
                name: true,
                description: true,
                resources: {
                  select: {
                    resource: {
                      select: {
                        db_id: true,
                        name: true,
                        image_url: true,
                        released: true
                      }
                    }
                  },
                  orderBy: {
                    resource: {
                      released: 'asc'
                    }
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            favorite_folders: true
          }
        }
      }
    })

    if (!detail) return '资源不存在'

    // 转换数据结构并按 showAccordion 排序
    const playList: PlayListItem[] = detail.play_links
      .map(item => ({
        accordion: item.accordion,
        showAccordion: item.show_accordion,
        link: item.link
      }))
      .sort((a, b) => {
        // 获取排序值：如果 showAccordion 为空，使用 accordion
        const getSortValue = (item: { showAccordion: string; accordion: number }) => {
          return item.showAccordion ? item.showAccordion : item.accordion.toString()
        }

        const sortValueA = getSortValue(a)
        const sortValueB = getSortValue(b)

        // 尝试转换为数字进行排序
        const numA = parseFloat(sortValueA)
        const numB = parseFloat(sortValueB)

        // 如果都是有效数字，按数值排序
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB
        }

        // 如果有一个不是数字，数字优先
        if (!isNaN(numA) && isNaN(numB)) return -1
        if (isNaN(numA) && !isNaN(numB)) return 1

        // 都不是数字时，按字符串排序
        return sortValueA.localeCompare(sortValueB)
      })

    const introduce: Introduction = {
      text: detail.introduction,
      created: detail.created.toISOString(),
      updated: (detail.updated || detail.created).toISOString(),
      released: detail.released,
      dbId: detail.db_id,
      alias: detail.aliases?.map((item) => item.name) as string[],
      tags: detail.tag_relations.map((relation) => relation.tag),
      playList,
      isFavorite: detail.favorite_folders?.length > 0,
      _count: {
        view: detail.view,
        download: detail.download,
        comment: detail._count.comments,
        favorited: detail._count.favorite_folders
      }
    }

    const coverData: Cover = {
      title: detail.name,
      author: detail.author,
      translator: detail.translator,
      image: detail.image_url
    }

    // 处理系列信息
    const series = detail.series_relations.length > 0
      ? detail.series_relations.map((rel) => ({
        id: rel.series.id,
        name: rel.series.name,
        description: rel.series.description,
        resources: rel.series.resources.map((r) => ({
          dbId: r.resource.db_id,
          name: r.resource.name,
          image: r.resource.image_url,
          released: r.resource.released
        }))
      }))
      : null

    await setKv(
      `${CACHE_KEY}:${input.id}`,
      JSON.stringify({ introduce, coverData, series }),
      RESOURCE_CACHE_DURATION
    )


    await prisma.resource.update({
      where: { id: detail.id },
      data: {
        view: detail.view + 1,
        updated: detail.updated
      }
    })

    return { introduce, coverData, series }
  } catch (error) {
    console.error('获取资源详情失败:', error)
    return error instanceof Error ? error.message : '获取资源详情时发生未知错误'
  }
}

export const GET = async (req: NextRequest) => {
  const input = ParseGetQuery(req, detailIdSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }
  const response = await getDetailData(input)
  return NextResponse.json(response)
}
