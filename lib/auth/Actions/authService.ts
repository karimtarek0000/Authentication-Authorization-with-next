'use server'

import {
  $checkPermissions,
  $permissionsOfPages,
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  PAGES,
  PERMISSIONS_COOKIE,
  redirectToLogin,
  REFRESH_COOKIE,
  refreshToken,
  replaceCookie,
  TPages,
} from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const restoreSessionToken = async (req: NextRequest, _refreshToken: string) => {
  try {
    const newAccessToken = await refreshToken(_refreshToken)

    const headers = new Headers(req.headers)
    headers.set('cookie', replaceCookie(req.headers.get('cookie'), ACCESS_COOKIE, newAccessToken))

    const res = NextResponse.next({ request: { headers } })

    res.cookies.set(ACCESS_COOKIE, newAccessToken, COOKIE_OPTIONS)

    return res
  } catch {
    return redirectToLogin(req)
  }
}

export const checkCookiesBeforeRoute = async (req: NextRequest) => {
  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value

  return {
    accessToken,
    refreshToken,
  }
}

export const checkPermissionsOnServer = async (req: NextRequest, pathname: string) => {
  const userPermissions = req.cookies.get(PERMISSIONS_COOKIE)?.value
  const permissions = userPermissions ? JSON.parse(userPermissions) : []
  const page = pathname.split('/').pop() as TPages

  if ($permissionsOfPages[page]) {
    const hasPermissions = $checkPermissions(permissions, $permissionsOfPages[page])

    if (!hasPermissions) {
      return NextResponse.redirect(new URL(PAGES['dashboard'], req.url))
    }
  }

  return NextResponse.next()
}
