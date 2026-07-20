import { ACCESS_COOKIE, authService, isExpired, redirectToLogin } from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  if (req.headers.has('next-router-prefetch')) return NextResponse.next()

  const { accessToken, hasAuth, refreshToken } = await authService.checkCookies(req)

  const { pathname, searchParams } = req.nextUrl
  const isAuthPage = pathname.startsWith('/auth')
  const isAuth = Boolean(hasAuth && refreshToken)

  if (!isAuth) {
    return isAuthPage ? NextResponse.next() : redirectToLogin(req)
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(searchParams.get('backTo') ?? '/dashboard', req.url))
  }

  if (!isExpired(accessToken)) {
    // If case `Authorization` on header
    const headers = new Headers(req.headers)
    const accessToken = req.cookies.get(ACCESS_COOKIE)?.value
    headers.set('x-access-token', accessToken ?? '')

    return NextResponse.next({ request: { headers } })
  }

  return await authService.restoreSessionToken(req, refreshToken!)
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
