import { refreshToken, userLogout } from '@/lib/auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

// ================ ABORT_CONTROLLER ================
let controller = new AbortController()

export const abortPending = () => {
  controller.abort()
  controller = new AbortController()
}

// ================ REFRESH_TOKEN ================
let refreshTokenStatus: Promise<string | null> | null = null

const refreshTokenHandler = (): Promise<string | null> => {
  if(refreshTokenStatus) return refreshTokenStatus

  refreshTokenStatus = (async () => {
    try {
     const token = await refreshToken()

     return token
    } catch {
      userLogout()
    } finally {
      refreshTokenStatus = null
    }
  })()

  return refreshTokenStatus
}

// ================ API_FETCH ================
async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  retries = 2,
): Promise<T> {
  // const token = await getCookie(ACCESS_COOKIE)

  const res = await fetch(BASE_URL + path, {
    ...opts,
    credentials: 'include',
    signal: opts.signal ?? controller.signal,
    headers: {
      'Content-Type': 'application/json',
      // ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers,
    },
  })

  if (res.status === 401) {
    const newToken = await refreshTokenHandler()
    if (newToken) return apiFetch<T>(path, opts, retries)
  }

  if (!res.ok) {
    if (res.status >= 500 && failRetries > 0) {
      return apiFetch<T>(path, opts, retries - 1)
    }

    throw Object.assign(new Error(res.statusText), {
      status: res.status,
      data: await res.json().catch(() => null))?.message,
    })
  }

  return res.json()
}

// ================ METHODS ================
export const fetchClient = {
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
