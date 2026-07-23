'use client'

import { abortPending } from '@/lib/auth'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, type ReactNode } from 'react'

const AbortOnRouteChange = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return

    previousPathname.current = pathname
    abortPending()
  }, [pathname])

  return children
}

export default AbortOnRouteChange
