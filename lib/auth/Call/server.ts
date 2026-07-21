import { cookies } from 'next/headers'

export async function fetchServer<T>(path: string, opts: RequestInit = { method: 'GET' }) {
  const c = await cookies()
  const accessToken = c.get('accessToken')?.value

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
