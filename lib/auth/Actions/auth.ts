'use server'

import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  PAGES,
  Permission,
  PERMISSIONS_COOKIE,
  REFRESH_COOKIE,
} from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { setCookie } from './cookies'

export const whenUserLogin = async (permission: Permission[]) => {
  await setCookie(PERMISSIONS_COOKIE, JSON.stringify(permission), COOKIE_OPTIONS)
}

export const userLogout = async () => {
  const cookie = await cookies()

  cookie.delete(ACCESS_COOKIE)
  cookie.delete(REFRESH_COOKIE)
  cookie.delete(PERMISSIONS_COOKIE)

  redirect(PAGES['auth'])
}
