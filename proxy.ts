import {
  checkCookiesBeforeRoute,
  checkPermissionsOnServer,
  isExpired,
  PAGES,
  redirectToLogin,
  restoreSessionToken,
} from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  if (req.headers.has('next-router-prefetch')) return NextResponse.next()

  const { accessToken, refreshToken } = await checkCookiesBeforeRoute(req)

  const { pathname } = req.nextUrl
  const isAuthPage = pathname.startsWith(PAGES['auth'])

  const isAuth = Boolean(accessToken && refreshToken)

  if (!isAuth) {
    return isAuthPage ? NextResponse.next() : redirectToLogin(req)
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(PAGES['dashboard'], req.url))
  }

  if (isAuth && !isAuthPage) {
    return checkPermissionsOnServer(req, pathname)
  }

  if (!isExpired(accessToken)) {
    return NextResponse.next()
  }

  return await restoreSessionToken(req, refreshToken!)
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
