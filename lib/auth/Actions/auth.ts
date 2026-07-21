'use server'

import { cookies } from 'next/headers'
import { ACCESS_COOKIE, HASAUTH_COOKIE, REFRESH_COOKIE } from '../Config'

export const userLogout = async () => {
  const cookie = await cookies()
  cookie.delete(ACCESS_COOKIE)
  cookie.delete(REFRESH_COOKIE)
  cookie.delete(HASAUTH_COOKIE)
}
