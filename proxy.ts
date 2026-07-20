import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { refreshToken } from './lib/auth/Actions'

export async function proxy(request: NextRequest) {
  // await refreshToken()
  // console.log('middleware')
  // const headers = new Headers(request.headers)
  // headers.set('x-access-token', accessToken)
  //   return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
