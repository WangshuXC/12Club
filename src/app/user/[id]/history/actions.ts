'use server'

import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { safeParseSchema } from '@/utils/actions/safeParseSchema'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

const getPlayHistorySchema = z.object({
  uid: z.coerce.number().min(1).max(9999999),
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(20)
})

export interface PlayHistoryItem {
  dbId: string
  name: string
  imageUrl: string
  accordion: number
  showAccordion: string
  lastPlayedAt: string
}

export const getActions = async (
  params: z.infer<typeof getPlayHistorySchema>
) => {
  const input = safeParseSchema(getPlayHistorySchema, params)
  if (typeof input === 'string') {
    return input
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登录失效'
  }

  try {
    const visitor = await prisma.trackingVisitor.findFirst({
      where: { user_id: input.uid }
    })
    if (!visitor) {
      return { history: [] as PlayHistoryItem[], total: 0 }
    }

    const events = await prisma.trackingEvent.findMany({
      where: {
        visitor_id: visitor.id,
        event_name: 'accordion-play',
        event_type: 'custom'
      },
      orderBy: { timestamp: 'desc' },
      select: {
        extra_data: true,
        timestamp: true
      }
    })

    const latestMap = new Map<string, { accordion: number; timestamp: Date }>()
    for (const event of events) {
      const extraData = event.extra_data as Record<string, unknown> | null
      if (!extraData) continue

      const dbId = String(extraData['dbid'] || '')
      const accordion = Number(extraData['accordion'] || 1)
      if (!dbId) continue

      const existing = latestMap.get(dbId)
      if (!existing || accordion > existing.accordion) {
        latestMap.set(dbId, { accordion, timestamp: event.timestamp })
      } else if (
        accordion === existing.accordion &&
        event.timestamp > existing.timestamp
      ) {
        latestMap.set(dbId, { accordion, timestamp: event.timestamp })
      }
    }

    const sortedEntries = Array.from(latestMap.entries()).sort(
      (a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime()
    )

    const total = sortedEntries.length
    const paged = sortedEntries.slice(
      (input.page - 1) * input.limit,
      input.page * input.limit
    )

    const dbIds = paged.map(([dbId]) => dbId)
    const resources = await prisma.resource.findMany({
      where: { db_id: { in: dbIds } },
      select: {
        db_id: true,
        name: true,
        image_url: true,
        play_links: {
          select: { accordion: true, show_accordion: true },
          orderBy: { accordion: 'asc' }
        }
      }
    })
    const resourceMap = new Map(resources.map((r) => [r.db_id, r]))

    const history: PlayHistoryItem[] = paged.map(([dbId, data]) => {
      const resource = resourceMap.get(dbId)
      const playLink = resource?.play_links.find(
        (l) => l.accordion === data.accordion
      )

      return {
        dbId,
        name: resource?.name || '未知资源',
        imageUrl: resource?.image_url || '',
        accordion: data.accordion,
        showAccordion: playLink?.show_accordion || `第 ${data.accordion} 集`,
        lastPlayedAt: data.timestamp.toISOString()
      }
    })

    return { history, total }
  } catch (error) {
    console.error('获取播放历史失败:', error)
    return error instanceof Error ? error.message : '获取播放历史时发生未知错误'
  }
}
