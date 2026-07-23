'server-only'

import {
  ACCESS_COOKIE,
  HASAUTH_COOKIE,
  PAGES,
  PERMISSIONS_COOKIE,
  REFRESH_BUFFER,
  REFRESH_COOKIE,
} from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

function decodePayload(token: string) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return JSON.parse(atob(padded))
}

export function isExpired(token?: string) {
  if (!token) return true

  try {
    const { exp } = decodePayload(token)
    return typeof exp !== 'number' || Date.now() >= (exp - REFRESH_BUFFER) * 1000
  } catch {
    return true
  }
}

export function replaceCookie(header: string | null, name: string, value: string) {
  return (header ?? '')
    .split(';')
    .map(c => c.trim())
    .filter(c => c && !c.startsWith(`${name}=`))
    .concat(`${name}=${value}`)
    .join('; ')
}

export function redirectToLogin(req: NextRequest) {
  const url = new URL(PAGES['auth'], req.url)
  url.searchParams.set('backTo', req.nextUrl.pathname)

  const res = NextResponse.redirect(url)

  res.cookies.delete(ACCESS_COOKIE)
  res.cookies.delete(REFRESH_COOKIE)
  res.cookies.delete(PERMISSIONS_COOKIE)
  res.cookies.delete(HASAUTH_COOKIE)

  res.cookies.set('sessionExpired', '1', {
    path: '/',
    maxAge: 30,
    httpOnly: false,
  })
  return res
}
