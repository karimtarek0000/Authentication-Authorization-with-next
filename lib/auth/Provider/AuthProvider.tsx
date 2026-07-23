'use client'

import { AuthActions, AuthProviderProps } from '@/lib/auth'
import { AbortOnRouteChange, AuthActionsContext, AuthStateContext, Idle, SyncTabs } from '@/lib/auth/Provider'
import { useAuthService } from '@/lib/auth/Service'
import { useMemo } from 'react'

export function AuthProvider({ children }: AuthProviderProps) {
  const { login, logout, loginWithOAuth, userAuth, listenToLogout, isLoading } = useAuthService()

  const actions = useMemo<AuthActions>(
    () => ({ login, loginWithOAuth, listenToLogout, logout }),
    [login, loginWithOAuth, logout, listenToLogout],
  )

  if (isLoading) return null

  return (
    <AuthStateContext.Provider value={userAuth}>
      <AuthActionsContext.Provider value={actions}>
        <SyncTabs>
          <Idle>
            <AbortOnRouteChange>{children}</AbortOnRouteChange>
          </Idle>
        </SyncTabs>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export default AuthProvider
