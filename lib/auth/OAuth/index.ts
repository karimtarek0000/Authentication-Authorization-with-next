import {
  GITHUB_AUTHORIZE_URL,
  GITHUB_CLIENT_ID,
  GOOGLE_AUTHORIZE_URL,
  GOOGLE_CLIENT_ID,
  type OAuthProvider,
} from '@/lib/auth'

const STATE_KEY_PREFIX = 'oauth_state_'

export const getOAuthRedirectURL = (provider: OAuthProvider) =>
  `${window.location.origin}/auth/callback/${provider}`

const startOAuthLogin = (
  provider: OAuthProvider,
  authorizeUrl: string,
  clientId: string,
  scope: string,
) => {
  const state = crypto.randomUUID()
  sessionStorage.setItem(`${STATE_KEY_PREFIX}${provider}`, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectURL(provider),
    response_type: 'code',
    scope,
    state,
  })

  window.location.href = `${authorizeUrl}?${params.toString()}`
}

export const startGoogleLogin = () =>
  startOAuthLogin('google', GOOGLE_AUTHORIZE_URL, GOOGLE_CLIENT_ID!, 'openid email profile')

export const startGithubLogin = () =>
  startOAuthLogin('github', GITHUB_AUTHORIZE_URL, GITHUB_CLIENT_ID!, 'read:user user:email')

export const consumeOAuthState = (provider: OAuthProvider, receivedState: string | null) => {
  const key = `${STATE_KEY_PREFIX}${provider}`
  const storedState = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)

  return !!storedState && !!receivedState && storedState === receivedState
}
