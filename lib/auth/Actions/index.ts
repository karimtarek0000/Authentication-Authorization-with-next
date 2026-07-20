'use server'

import { cookies } from 'next/headers'

export const setCookie = async (name: string, value: string) => {
  const cookie = await cookies()
  cookie.set(name, value)
}
