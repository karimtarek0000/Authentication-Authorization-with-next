import { REFRESH_TOKEN } from '@/lib/auth'

export const refreshToken = async (refreshToken?: string) => {
  try {
    const headers = refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : null

    const res = await fetch(REFRESH_TOKEN, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers,
    })

    if (!res.ok) throw new Error('Refresh token failed')
    
    const data = await res.json()

    return data.accessToken
  } catch (error) {
    throw error
  }
}
