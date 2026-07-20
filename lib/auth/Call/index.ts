// import { refreshToken } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const TIMEOUT = 10_000
const isServer = typeof window === 'undefined'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly data: unknown,
  ) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
  }
}

// Client access token lives in memory. Call this after login and refresh.
let accessToken: string | null = null
export const setAccessToken = (token: string | null) => {
  accessToken = token
}

// ====================== REFRESH_TOKEN ======================
// let refreshing: Promise<string | null> | null = null
// const refreshOnce = () => (refreshing ??= refreshToken().finally(() => (refreshing = null)))

async function buildHeaders(init: HeadersInit | undefined, isJson: boolean) {
  const headers = new Headers(init)
  if (isJson) headers.set('content-type', 'application/json')

  if (isServer) {
    // Server fetch has no cookie jar, so forward the incoming ones by hand.
    const { cookies } = await import('next/headers')
    const store = await cookies()
    const token = store.get('accessToken')?.value
    if (token) headers.set('authorization', `Bearer ${token}`)
    headers.set('cookie', store.toString())
  } else if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  return headers
}

export type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...restOfOptions } = options
  const isJson = body !== undefined && !(body instanceof FormData)

  const send = async () =>
    fetch(new URL(path.replace(/^\//, ''), `${BASE_URL}/`), {
      ...restOfOptions,
      body: isJson ? JSON.stringify(body) : (body as BodyInit | undefined),
      headers: await buildHeaders(headers, isJson),
      signal: restOfOptions.signal ?? AbortSignal.timeout(TIMEOUT),
      credentials: 'include',
      cache: restOfOptions.cache ?? 'no-store',
    })

  const response = await send()

  // Refresh once on 401, then replay. On the server we can't write the new
  // cookie during render, so middleware owns the refresh there.
  if (response.status === 401 && !isServer) {
    console.log('Error 401')

    // const token = await refreshOnce()
    // if (token) {
    //   setAccessToken(token)
    //   response = await send()
    // }
  }

  if (!response.ok) throw new ApiError(response.status, await response.json().catch(() => null))
  if (response.status === 204) return null as T

  return response.json()
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
}
