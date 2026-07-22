'use client'

import { userLogout } from '@/lib/auth'
import { authChannel } from '@/lib/auth/Provider'
import { useEffect, type ReactNode } from 'react'

const SyncTabs = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const unsubscribe = authChannel.subscribe(event => {
      if (event === 'logout') {
        userLogout()
      }
    })

    return unsubscribe
  }, [])

  return children
}

export default SyncTabs
