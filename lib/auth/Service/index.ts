'use client'

import {
  api,
  AuthState,
  getCookie,
  HASAUTH_COOKIE,
  ILogin,
  ILoginResponse,
  PROFILE,
  userLogout,
  whenUserLogin,
} from '@/lib/auth'
import { useCallback, useEffect, useState } from 'react'

export const initialAuthState: AuthState = {
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const useAuthService = () => {
  const [userAuth, setUserAuth] = useState<AuthState>(initialAuthState)

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
      await whenUserLogin(data.permissions)

      setAuthData(data)
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await userLogout()
  }

  const userProfile = useCallback(async () => {
    const hasAuth = await getCookie(HASAUTH_COOKIE)

    if (!hasAuth) return

    try {
      const data = await api.get<ILoginResponse>(PROFILE)
      setAuthData(data)
      console.log('Working 🚀')
    } catch {
      logout()
    }
  }, [])

  useEffect(() => {
    const profile = async () => await userProfile()
    profile()
  }, [userProfile])

  return { login, logout, userAuth }
}
