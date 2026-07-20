import { REFRESH_BUFFER } from '@/lib/auth'

function decodePayload(token: string) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return JSON.parse(atob(padded))
}

export function isExpired(token?: string) {
  if (!token) return true

  try {
    const { exp } = decodePayload(token)
    return typeof exp !== 'number' || Date.now() >= (exp - REFRESH_BUFFER) * 1000
  } catch {
    return true
  }
}

export function replaceCookie(header: string | null, name: string, value: string) {
  return (header ?? '')
    .split(';')
    .map(c => c.trim())
    .filter(c => c && !c.startsWith(`${name}=`))
    .concat(`${name}=${value}`)
    .join('; ')
}
