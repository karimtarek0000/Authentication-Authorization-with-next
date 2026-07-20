import { authService, isExpired } from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  if (req.headers.has('next-router-prefetch')) return NextResponse.next()

  const { accessToken, hasAuth, refreshToken } = await authService.checkCookies(req)

  if (!isExpired(accessToken) || !hasAuth || !refreshToken) {
    return NextResponse.next()
  }

  authService.restoreSessionToken(req, refreshToken)
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
