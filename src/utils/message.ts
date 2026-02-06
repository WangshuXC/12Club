import { prisma } from '../../prisma'

import type { CreateMessageType } from '@/types/api/message'

export const createMessage = async (data: CreateMessageType) => {
  const message = await prisma.userMessage.create({
    data
  })

  return message
}

export const createDedupMessage = async (data: CreateMessageType) => {
  const duplicatedMessage = await prisma.userMessage.findFirst({
    where: {
      ...data
    }
  })
  if (duplicatedMessage) {
    return
  }

  const message = createMessage(data)

  return message
}
