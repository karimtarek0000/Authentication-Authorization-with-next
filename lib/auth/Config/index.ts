export const LOGIN = '/auth-test'
export const REFRESH_TOKEN = `${process.env.NEXT_PUBLIC_API_URL}/refresh`
export const PROFILE = '/me'

export const REFRESH_BUFFER = 30
export const ACCESS_COOKIE = 'accessToken'
export const REFRESH_COOKIE = 'refreshToken'
export const HASAUTH_COOKIE = 'hasAuth'

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

export const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'

export const OAUTH_PLATFORM = {
  google: '/auth/google',
  github: '/auth/github',
} as const
