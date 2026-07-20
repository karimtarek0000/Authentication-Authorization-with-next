import { cookies, headers } from 'next/headers'

async function serverFetch<T>(path: string, opts: RequestInit = {}) {
  const h = await headers()
  const c = await cookies()
  const accessToken = h.get('x-access-token') ?? c.get('accessToken')?.value

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Cookie: `accessToken=${accessToken}`,
      ...opts.headers,
    },
  })
  if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status })
  return res.json() as Promise<T>
}

export const apiServer = {
  get: <T>(path: string, options?: RequestInit) =>
    serverFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    serverFetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
}
