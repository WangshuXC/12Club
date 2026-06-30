import { authMiddleware } from './middleware/auth'

import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/edit/:path*', '/message/:path*']
}

export const middleware = async (request: NextRequest) => {
  return authMiddleware(request)
}
