'use client'

import { api, AuthState, ILogin, ILoginResponse, REFRESH_TOKEN, setCookie } from '@/lib/auth'
import { useCallback, useState } from 'react'

// const restorePromise: Promise<Login | null> | null = null
let refreshPromise: Promise<string | undefined> | null = null

const initialAuthState: AuthState = {
  accessToken: '',
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const authService = {
  async refreshToken() {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const response = await fetch(REFRESH_TOKEN, {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!response.ok) throw new Error('Error')

        const data = await response.json()

        return data.accessToken
      } catch (error) {
        console.log(error)
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  },
}

export const useAuthService = (initialToken: string | null) => {
  //   const [isLoading, setLoading] = useState()
  //   const [accessToken, setAccessToken] = useState()
  const [userAuth, setUserAuth] = useState<AuthState>({
    ...initialAuthState,
    accessToken: initialToken,
  })

  const setAuthData = (data: any) => {
    const { id, name, permissions, role, accessToken } = data

    setUserAuth({
      user: { id, name },
      accessToken,
      permissions,
      role,
      isAuth: true,
    })

    setCookie('hasAuth', 'true')
  }

  const login = async ({ email, password }: ILogin) => {
    try {
      const data = await api.post<ILoginResponse>('/auth-test', { email, password })

      setAuthData(data)
      return data
    } catch (error) {
      throw error
    }
  }

  // =================== Restore Session Functions ===================
  const refreshToken = useCallback(() => {}, [])

  return { login, userAuth }
}
