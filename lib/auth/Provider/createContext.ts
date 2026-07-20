'use client'

import { AuthActions, AuthState } from '@/lib/auth'
import { createContext } from 'react'

export const AuthStateContext = createContext<AuthState | null>(null)
export const AuthActionsContext = createContext<AuthActions | null>(null)
