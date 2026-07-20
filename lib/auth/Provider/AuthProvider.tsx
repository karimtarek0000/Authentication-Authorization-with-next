'use client'

import {
  AuthActions,
  AuthActionsContext,
  AuthProviderProps,
  AuthStateContext,
  useAuthService,
} from '@/lib/auth'
import { useMemo } from 'react'

export function AuthProvider({ initialToken, children }: AuthProviderProps) {
  const { login, userAuth } = useAuthService(initialToken)

  const actions = useMemo<AuthActions>(() => ({ login }), [login])

  return (
    <AuthStateContext.Provider value={userAuth}>
      <AuthActionsContext.Provider value={actions}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
