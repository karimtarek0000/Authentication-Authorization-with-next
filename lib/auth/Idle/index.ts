'use client'

import { useAuthActions, useAuthState } from '@/lib/auth/Provider'
import { useEffect, useRef } from 'react'

const IDLE_LIMIT = 15 * 60 * 1000 // 15 minutes
const THROTTLE_INTERVAL = 2000

const ACTIVITY_EVENTS = ['keydown', 'click', 'scroll', 'touchstart', 'mousemove']

export function useIdleTimeout() {
  const { isAuth } = useAuthState()
  const { logout } = useAuthActions()
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastResetRef = useRef<number>(0)

  useEffect(() => {
    if (!isAuth) return

    lastResetRef.current = Date.now()

    const resetTimer = () => {
      const now = Date.now()

      if (now - lastResetRef.current < THROTTLE_INTERVAL) return
      lastResetRef.current = now

      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)

      logoutTimerRef.current = setTimeout(logout, IDLE_LIMIT)
    }

    resetTimer()

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true })
    })

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)

      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [isAuth, logout])
}
