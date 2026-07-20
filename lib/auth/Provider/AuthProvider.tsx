'use client'

import {
  AuthActions,
  AuthActionsContext,
  AuthProviderProps,
  authService,
  AuthStateContext,
  useAuthService,
} from '@/lib/auth'
import { useEffect, useMemo } from 'react'

export function AuthProvider({ initialToken, children }: AuthProviderProps) {
  const { login, userAuth } = useAuthService()

  const actions = useMemo<AuthActions>(() => ({ login }), [login])

  useEffect(() => {
    if (initialToken !== null) {
      authService.accessToken = initialToken!
    }
  }, [initialToken])

  return (
    <AuthStateContext.Provider value={userAuth}>
      <AuthActionsContext.Provider value={actions}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
