'use server'

import {
  ACCESS_COOKIE,
  AuthState,
  HASAUTH_COOKIE,
  ILoginResponse,
  initialAuthState,
  PAGES,
  PROFILE,
  REFRESH_COOKIE,
} from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { apiServer } from '../Call'
import { getCookie } from './cookies'

export const userProfile = cache(async () => {
  const hasAuth = await getCookie(HASAUTH_COOKIE)

  if (!hasAuth) return initialAuthState

  try {
    const { id, name, permissions, role } = await apiServer.get<ILoginResponse>(PROFILE)

    console.log('Working 🚀')

    return { user: { id, name }, permissions, role } as AuthState
  } catch {
    return userLogout()
  }
})

export const userLogout = async () => {
  const cookie = await cookies()

  cookie.delete(ACCESS_COOKIE)
  cookie.delete(REFRESH_COOKIE)
  cookie.delete(HASAUTH_COOKIE)

  redirect(PAGES['auth'])
}
