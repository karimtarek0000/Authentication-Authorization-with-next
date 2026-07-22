'use client'

import { AuthActions, AuthProviderProps } from '@/lib/auth'
import { AuthActionsContext, AuthStateContext, Idle, SyncTabs } from '@/lib/auth/Provider'
import { useAuthService } from '@/lib/auth/Service'
import { useMemo } from 'react'

export function AuthProvider({ children }: AuthProviderProps) {
  const { login, logout, loginWithOAuth, userAuth, isLoading } = useAuthService()

  const actions = useMemo<AuthActions>(
    () => ({ login, loginWithOAuth, logout }),
    [login, loginWithOAuth, logout],
  )

  if (isLoading) return null

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
