'use client'

import { AuthContext, AuthProviderProps, useAuthService } from '@/lib/auth'

export function AuthProvider({ initialToken, children }: AuthProviderProps) {
  const { login } = useAuthService(initialToken)

  return <AuthContext.Provider value={{ login }}>{children}</AuthContext.Provider>
}

export default AuthProvider
