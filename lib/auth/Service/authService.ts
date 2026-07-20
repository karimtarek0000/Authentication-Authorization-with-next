import {
  ACCESS_COOKIE,
  HASAUTH_COOKIE,
  redirectToLogin,
  REFRESH_COOKIE,
  REFRESH_TOKEN,
  replaceCookie,
} from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const authService = {
  accessToken() {
    if (typeof document === 'undefined') return null
    return document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)?.[1] ?? null
  },
  async refreshToken(refreshToken?: string) {
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

      this.accessToken = data.accessToken
      return data.accessToken
    } catch (error) {
      console.log(error)
    }
  },
  async restoreSessionToken(req: NextRequest, refreshToken: string) {
    try {
      const newAccessToken = await authService.refreshToken(refreshToken)

      const headers = new Headers(req.headers)
      headers.set('cookie', replaceCookie(req.headers.get('cookie'), ACCESS_COOKIE, newAccessToken))

      // If case `Authorization` on header
      headers.set('x-access-token', newAccessToken)

      const res = NextResponse.next({ request: { headers } })

      res.cookies.set(ACCESS_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return res
    } catch {
      return redirectToLogin(req)
    }
  },
  async checkCookies(req: NextRequest) {
    const accessToken = req.cookies.get(ACCESS_COOKIE)?.value
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value
    const hasAuth = req.cookies.get(HASAUTH_COOKIE)?.value

    return {
      accessToken,
      refreshToken,
      hasAuth,
    }
  },
}
