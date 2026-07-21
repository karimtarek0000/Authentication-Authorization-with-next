import {
  ACCESS_COOKIE,
  getCookie,
  redirectToLogin,
  REFRESH_COOKIE,
  REFRESH_TOKEN,
  replaceCookie,
} from '@/lib/auth'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextRequest, NextResponse } from 'next/server'

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

export const refreshToken = async (refreshToken?: string) => {
  try {
    const headers = refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : undefined

    const response = await fetch(REFRESH_TOKEN, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers,
    })

    if (!response.ok) throw new Error('Refresh token failed')
    const data = await response.json()

    return data.accessToken
  } catch (error) {
    throw error
  }
}

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
