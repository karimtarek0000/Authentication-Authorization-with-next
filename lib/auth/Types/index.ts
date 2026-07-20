import { ReactNode } from 'react'

// ================= USER =================
export interface AuthUser {
  id: string
  name: string
}

export interface ILogin {
  email: string
  password: string
}

export interface ILoginResponse {
  accessToken: string
  id: string
  name: string
  email: string
  permissions: []
}

// ================= CONTEXT_API =================
export type AuthProviderProps = {
  children: ReactNode
  initialToken: string | null
}

export type AuthState = {
  accessToken: string | null
  user: AuthUser | null
  permissions: Permission[]
  role: string
  isAuth: boolean
}

export type AuthActions = {
  login: ({ email, password }: ILogin) => Promise<ILoginResponse>
  // refreshToken: () => Promise<string | undefined>
  // loginWithOAuth: (provider: OAuthProvider, code: string) => Promise<void>
  // logout: () => void
}

// ================= SYNC =================
export type AuthEvent = 'logout'

// ================= PERMISSIONS =================
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_PROFILE: 'edit_profile',
  MANAGE_USERS: 'manage_users',
  EDIT_TESTING: 'edit_testing',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type PermissionRequirement =
  | { permission: Permission }
  | { anyOf: Permission[] }
  | { allOf: Permission[] }
