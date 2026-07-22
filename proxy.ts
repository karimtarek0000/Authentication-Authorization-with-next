import {
  $checkPermissions,
  $permissionsOnServer,
  checkCookiesBeforeRoute,
  isExpired,
  PAGES,
  PERMISSIONS_COOKIE,
  redirectToLogin,
  restoreSessionToken,
  TPages,
} from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  if (req.headers.has('next-router-prefetch')) return NextResponse.next()

  const { accessToken, refreshToken } = await checkCookiesBeforeRoute(req)

  const { pathname, searchParams } = req.nextUrl
  const isAuthPage = pathname.startsWith(PAGES['auth'])
  const isAuth = Boolean(accessToken && refreshToken)

  if (!isAuth) {
    return isAuthPage ? NextResponse.next() : redirectToLogin(req)
  }

  if (isAuthPage) {
    return NextResponse.redirect(new URL(searchParams.get('backTo') ?? PAGES['dashboard'], req.url))
  }

  // FOR PERMISSIONS
  if (isAuth) {
    const userPermissions = req.cookies.get(PERMISSIONS_COOKIE)?.value
    const permissions = userPermissions ? JSON.parse(userPermissions) : []
    const page = pathname.split('/').pop() as TPages

    if ($permissionsOnServer[page]) {
      const hasPermissions = $checkPermissions(permissions, $permissionsOnServer[page])

      if (!hasPermissions) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  }

  if (!isExpired(accessToken)) {
    return NextResponse.next()
  }

  return await restoreSessionToken(req, refreshToken!)
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
