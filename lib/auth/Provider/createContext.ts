'use client'

import { ILogin, ILoginResponse } from '@/lib/auth'
import { createContext, useContext } from 'react'

interface IAuthContext {
  // token: string | null
  login: ({ email, password }: ILogin) => Promise<ILoginResponse>
}

export const AuthContext = createContext<IAuthContext | null>(null)

export const useAuthActions = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('You are using the hook ouside a component')
  }

  return context
}
