'use client'

import { api, AuthState, ILogin, ILoginResponse, setCookie } from '@/lib/auth'
import { useState } from 'react'

const initialAuthState: AuthState = {
  accessToken: '',
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
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

  return { login, userAuth }
}
