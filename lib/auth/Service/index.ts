'use client'

import {
  api,
  AuthState,
  getCookie,
  HASAUTH_STORAGE,
  ILogin,
  ILoginResponse,
  PROFILE,
  userLogout,
  whenUserLogin,
} from '@/lib/auth'
import { useCallback, useEffect, useRef, useState } from 'react'

export const initialAuthState: AuthState = {
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const useAuthService = () => {
  const [userAuth, setUserAuth] = useState<AuthState>(initialAuthState)
  const hasAuth = useRef<string | null>(null)

  const setAuthData = (data: any) => {
    const { id, name, permissions, role } = data

    setUserAuth({
      user: { id, name },
      permissions,
      role,
      isAuth: true,
    })

    localStorage.setItem('hasAuth', 'true')
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
    localStorage.removeItem(HASAUTH_STORAGE)
    await userLogout()
  }

  const userProfile = useCallback(async () => {
    try {
      const data = await api.get<ILoginResponse>(PROFILE)
      setAuthData(data)
    } catch {
      logout()
    }
  }, [])

  useEffect(() => {
    hasAuth.current = localStorage.getItem(HASAUTH_STORAGE)

    if (hasAuth.current) {
      userProfile()
    }
  }, [userProfile])

  return { login, logout, userAuth }
}
