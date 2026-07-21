'use client'

import {
  api,
  authService,
  AuthState,
  ILogin,
  ILoginResponse,
  setCookie,
  userLogout,
} from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const initialAuthState: AuthState = {
  accessToken: '',
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const useAuthService = () => {
  const [userAuth, setUserAuth] = useState<AuthState>(initialAuthState)
  const { replace } = useRouter()

  const setAuthData = (data: any) => {
    const { id, name, permissions, role, accessToken } = data

    setUserAuth({
      user: { id, name },
      accessToken,
      permissions,
      role,
      isAuth: true,
    })
  }

  const login = async ({ email, password }: ILogin) => {
    try {
      const data = await api.post<ILoginResponse>('/auth-test', { email, password })
      await setCookie('hasAuth', 'true')

      setAuthData(data)
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await userLogout()
    replace('/auth')
  }

  return { login, logout, userAuth }
}
