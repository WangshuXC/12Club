import { NextResponse } from 'next/server'

import { authMiddleware } from './middleware/auth'

import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/edit/:path*']
}

export const middleware = async (request: NextRequest) => {
  return authMiddleware(request)
}
