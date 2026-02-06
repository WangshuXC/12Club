import { NextRequest } from 'next/server'
import { z } from 'zod'

import type { ZodSchema } from 'zod'

export const ParseGetQuery = <T extends ZodSchema>(
  req: NextRequest,
  schema: T
): z.infer<T> | string => {
  const { searchParams } = new URL(req.url)
  const queryParams = Object.fromEntries(searchParams.entries())

  const result = schema.safeParse(queryParams)
  if (!result.success) {
    return result.error.message
  }

  return result.data
}

export const ParsePostBody = async <T extends ZodSchema>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | string> => {
  const body = await req.json()

  const result = schema.safeParse(body)
  if (!result.success) {
    return result.error.message
  }

  return result.data
}

export const ParsePutBody = async <T extends ZodSchema>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | string> => {
  const body = await req.json()

  const result = schema.safeParse(body)
  if (!result.success) {
    return result.error.message
  }

  return result.data
}

export const ParseDeleteQuery = <T extends ZodSchema>(
  req: NextRequest,
  schema: T
): z.infer<T> | string => {
  const { searchParams } = new URL(req.url)

  const queryParams = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(queryParams)
  if (!result.success) {
    return result.error.message
  }

  return result.data
}

export const ParseFormData = async <T extends ZodSchema>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T> | string> => {
  const formData = await req.formData()
  const rawData: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      rawData[key] = value
    } else {
      rawData[key] = value.toString()
    }
  }

  const result = schema.safeParse(rawData)
  if (!result.success) {
    return result.error.message
  }

  return result.data
}
