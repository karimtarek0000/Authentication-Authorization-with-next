'use client'

import {
  AuthActions,
  AuthActionsContext,
  AuthProviderProps,
  AuthStateContext,
  useAuthService,
} from '@/lib/auth'
import { useMemo } from 'react'

export function AuthProvider({ userProfile, children }: AuthProviderProps) {
  const { login, logout, userAuth } = useAuthService(userProfile)

  const actions = useMemo<AuthActions>(() => ({ login, logout }), [login, logout])

  return (
    <AuthStateContext.Provider value={userAuth}>
      <AuthActionsContext.Provider value={actions}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
