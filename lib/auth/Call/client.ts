import { refreshToken } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

// ================ ABORT_CONTROLLER ================
let controller = new AbortController()

export const abortPending = () => {
  controller.abort()
  controller = new AbortController()
}

// ================ REFRESH_TOKEN ================
let refreshing: Promise<string | null> | null = null

const refreshOnce = (): Promise<string | null> => {
  refreshing ??= refreshToken()
    .then(token => token ?? null)
    .catch(() => null)
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

// ================ API_FETCH ================
const isRetryable = (status: number) => status >= 500 || status === 429

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  retries = 2,
  failRetries = 2,
): Promise<T> {
  // const token = await getCookie(ACCESS_COOKIE)

  const res = await fetch(BASE_URL + path, {
    ...opts,
    credentials: 'include',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      // ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers,
    },
  })

  if (res.status === 401 && retries > 0) {
    const newToken = await refreshOnce()
    if (newToken) return apiFetch<T>(path, opts, retries - 1, failRetries)
  }

  if (!res.ok) {
    if (isRetryable(res.status) && failRetries > 0) {
      return apiFetch<T>(path, opts, retries, failRetries - 1)
    }

    throw Object.assign(new Error(res.statusText), {
      status: res.status,
      data: await res.json().catch(() => null),
    })
  }

  return res.status === 204 ? (null as T) : res.json()
}

// ================ METHODS ================
export const api = {
  get: <T>(path: string, options?: RequestInit) => apiFetch<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, options?: RequestInit) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
}
