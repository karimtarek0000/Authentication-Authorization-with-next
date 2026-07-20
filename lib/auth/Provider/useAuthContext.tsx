import { AuthActionsContext, AuthStateContext } from '@/lib/auth'
import { useContext } from 'react'

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext)

  if (!context) {
    throw new Error('You are using the hook ouside a component')
  }

  return context
}

export const useAuthState = () => {
  const context = useContext(AuthStateContext)

  if (!context) {
    throw new Error('You are using the hook ouside a component')
  }

  return context
}
