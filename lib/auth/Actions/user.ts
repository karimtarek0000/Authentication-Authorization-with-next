'use server'

import {
  ACCESS_COOKIE,
  COOKIE_OPTIONS,
  deleteCookie,
  HASAUTH_COOKIE,
  PAGES,
  Permission,
  PERMISSIONS_COOKIE,
  REFRESH_COOKIE,
  setCookie,
} from '@/lib/auth'
import { redirect } from 'next/navigation'

export const whenUserLogin = async (permission: Permission[]) => {
  await Promise.all([
    setCookie(PERMISSIONS_COOKIE, JSON.stringify(permission), COOKIE_OPTIONS),
    setCookie(HASAUTH_COOKIE, 'true'),
  ])
}

export const userLogout = async () => {
  await deleteCookie([ACCESS_COOKIE, REFRESH_COOKIE, PERMISSIONS_COOKIE, HASAUTH_COOKIE])

  redirect(PAGES['auth'])
}
