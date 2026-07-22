'use server'

import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  getCookie,
  redirectToLogin,
  REFRESH_COOKIE,
  refreshToken,
  replaceCookie,
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

export const permissions = async () => {
  const permissions = await getCookie('permissions')
  return JSON.parse(permissions as string) as []
}
