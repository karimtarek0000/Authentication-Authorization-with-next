'use client'

import {
  AuthActions,
  AuthActionsContext,
  AuthProviderProps,
  AuthStateContext,
  Idle,
  SyncTabs,
  useAuthService,
} from '@/lib/auth'
import { useMemo } from 'react'

export function AuthProvider({ children }: AuthProviderProps) {
  const { login, logout, loginWithOAuth, userAuth } = useAuthService()

  const actions = useMemo<AuthActions>(
    () => ({ login, loginWithOAuth, logout }),
    [login, loginWithOAuth, logout],
  )

  return (
    <AuthStateContext.Provider value={userAuth}>
      <AuthActionsContext.Provider value={actions}>
        <SyncTabs>
          <Idle>{children}</Idle>
        </SyncTabs>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
