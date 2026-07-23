'use client'

import {
  AuthState,
  fetchClient,
  getCookie,
  getOAuthRedirectURL,
  HASAUTH_COOKIE,
  ILogin,
  ILoginResponse,
  OAUTH_PLATFORM,
  OAuthProvider,
  PROFILE,
  SESSION_EXPIRED_COOKIE,
  userLogout,
  whenUserLogin,
} from '@/lib/auth'
import { authChannel } from '@/lib/auth/Provider'
import { useCallback, useEffect, useState } from 'react'

export const initialAuthState: AuthState = {
  user: null,
  permissions: [],
  role: '',
  isAuth: false,
}

export const useAuthService = () => {
  const [userAuth, setUserAuth] = useState<AuthState>(initialAuthState)
  const [isLoading, setIsLoading] = useState(true)

  const setAuthData = (data: ILoginResponse) => {
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
      const data = await fetchClient.post<ILoginResponse>('/auth-test', { email, password })
      await whenUserLogin(data.permissions)

      setAuthData(data)
      return data
    } catch (error) {
      throw error
    }
  }

  const loginWithOAuth = async (provider: OAuthProvider, code: string) => {
    try {
      const endpoint = OAUTH_PLATFORM[provider]

      const data = await fetchClient.post(endpoint, {
        code,
        redirectURL: getOAuthRedirectURL(provider),
      })

      setAuthData(data)
    } catch (error) {
      throw error
    }
  }

  const listenToLogout = () => {
    if (document.cookie.includes(`${SESSION_EXPIRED_COOKIE}=1`)) {
      document.cookie = `${SESSION_EXPIRED_COOKIE}=; path=/; max-age=0`
      authChannel.broadcast('logout')
      location.reload()
    }
  }

  const logout = async () => await userLogout()

  const userProfile = useCallback(async () => {
    const hasAuth = await getCookie(HASAUTH_COOKIE)

    if (!hasAuth) {
      setIsLoading(false)
      return
    }

    try {
      const data = await fetchClient.get<ILoginResponse>(PROFILE)
      setAuthData(data)
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const profile = async () => await userProfile()
    profile()
  }, [userProfile])

  return { userAuth, login, logout, loginWithOAuth, listenToLogout, isLoading }
}
