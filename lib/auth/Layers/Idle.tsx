'use client'

import { useIdleTimeout } from '@/lib/auth/Provider'
import { type ReactNode } from 'react'

const Idle = ({ children }: { children: ReactNode }) => {
  useIdleTimeout()

  return children
}

export default Idle
