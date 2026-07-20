'use client'

import { api, AuthState, ILogin, ILoginResponse, REFRESH_TOKEN, setCookie } from '@/lib/auth'
import { useCallback, useState } from 'react'

// const restorePromise: Promise<Login | null> | null = null
const refreshPromise: Promise<string | undefined> | null = null

const initialAuthState: AuthState = {
  accessToken: '',
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const authService = {
  accessToken: '',

  async refreshToken() {
    try {
      const response = await fetch(REFRESH_TOKEN, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) throw new Error('There are an error')
      const data = await response.json()

      this.accessToken = data.accessToken
      return data.accessToken
    } catch (error) {
      console.log(error)
    }
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
      authService.accessToken = data.accessToken
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
