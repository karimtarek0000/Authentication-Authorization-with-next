import { AuthActionsContext, AuthStateContext } from '@/lib/auth/Provider'
import { useContext } from 'react'

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext)

  if (!context) {
    throw new Error('useAuthActions must be used within AuthProvider')
  }

  return context
}

export const useAuthState = () => {
  const context = useContext(AuthStateContext)

  if (!context) {
    throw new Error('useAuthState must be used within AuthProvider')
  }

  return context
}
