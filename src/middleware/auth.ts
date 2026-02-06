import { NextResponse } from 'next/server'

import { parseCookies } from '@/utils/cookies'

import type { NextRequest } from 'next/server'

const protectedPaths = ['/admin', '/user', '/edit']

export const isProtectedRoute = (pathname: string) =>
  protectedPaths.some((path) => pathname.startsWith(path))

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL('/login', request.url)

  return NextResponse.redirect(loginUrl)
}

const getToken = (request: NextRequest) => {
  const cookies = parseCookies(request.headers.get('cookie') ?? '')

  return cookies['12club-token']
}

export const authMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const token = getToken(request)

  if (isProtectedRoute(pathname) && !token) {
    return redirectToLogin(request)
  }

  return NextResponse.next()
}
