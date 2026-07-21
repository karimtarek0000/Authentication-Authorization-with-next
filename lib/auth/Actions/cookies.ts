'use server'

import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'

export const setCookie = async (name: string, value: string, opt?: Partial<ResponseCookie>) => {
  const cookie = await cookies()
  cookie.set(name, value, opt)
}

export const getCookie = async <T>(name: string): Promise<T> => {
  const cookie = await cookies()
  return cookie.get(name)?.value as T
}
