'use client'

import { consumeOAuthState, useAuthActions, type OAuthProvider } from '@/lib/auth'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CallBack() {
  const { provider } = useParams<{ provider: OAuthProvider }>()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const code = searchParams.get('code') ?? undefined
  const state = searchParams.get('state')
  const providerError = searchParams.get('error') ?? undefined

  useEffect(() => {
    const run = async () => {
      if (providerError) {
        setErrorMessage('The sign-in was cancelled or denied.')
        return
      }
      if (!provider || !code || !consumeOAuthState(provider, state)) {
        setErrorMessage('This sign-in link is invalid or has expired.')
        return
      }
      console.log('Code: ', code, 'Provider: ', provider)
      // try {
      //   await loginWithOAuth(provider, code)
      // } catch {
      //   setErrorMessage('We could not sign you in. Please try again.')
      // }
    }
    run()
  }, [provider, code, state, providerError])

  return (
    <main className="page">
      {!errorMessage ? (
        <p>Signing you in…</p>
      ) : (
        <>
          <p>{errorMessage}</p>
          <Link href="/auth">Back to login</Link>
        </>
      )}
    </main>
  )
}
