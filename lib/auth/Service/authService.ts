import { REFRESH_TOKEN } from '@/lib/auth'

export const authService = {
  accessToken: '',

  async refreshToken(refreshToken?: string) {
    try {
      const headers = refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : undefined

      const response = await fetch(REFRESH_TOKEN, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers,
      })

      if (!response.ok) throw new Error('Refresh token failed')
      const data = await response.json()

      this.accessToken = data.accessToken
      return data.accessToken
    } catch (error) {
      console.log(error)
    }
  },
}
