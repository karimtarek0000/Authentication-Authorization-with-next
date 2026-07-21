'server-only'

import { ACCESS_COOKIE, getCookie } from '@/lib/auth'

export async function fetchServer<T>(path: string, opts: RequestInit = { method: 'GET' }) {
  const accessToken = await getCookie(ACCESS_COOKIE)

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${accessToken}`,
      Cookie: `accessToken=${accessToken}`,
      ...opts.headers,
    },
  })
  if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status })
  return res.json() as Promise<T>
}
