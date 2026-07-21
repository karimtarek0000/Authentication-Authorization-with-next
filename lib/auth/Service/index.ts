'use client'

import { api, AuthState, ILogin, ILoginResponse, PAGES, setCookie, userLogout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export const initialAuthState: AuthState = {
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const useAuthService = (userProfile: AuthState) => {
  const { replace } = useRouter()
  const [userAuth, setUserAuth] = useState<AuthState>({
    ...userProfile,
    isAuth: true,
  })

  const setAuthData = (data: any) => {
    const { id, name, permissions, role } = data

    setUserAuth({
      user: { id, name },
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
    replace(PAGES['auth'])
  }

  return { login, logout, userAuth }
}
