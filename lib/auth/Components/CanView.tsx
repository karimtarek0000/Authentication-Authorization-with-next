'use client'

import { $checkPermissions, type PermissionRequirement } from '@/lib/auth'
import { useAuthState } from '@/lib/auth/Provider'
import type { ReactNode } from 'react'

export type CanViewProps = {
  permissionRequirement: PermissionRequirement
  children: ReactNode
  fallback?: ReactNode
}

export default function CanView({
  permissionRequirement,
  children,
  fallback = 'You not authorized to view this section',
}: CanViewProps) {
  const { permissions } = useAuthState()

  const allowed = $checkPermissions(permissions, permissionRequirement)

  if (!allowed) {
    return <h3>{fallback}</h3>
  }

  return children
}
