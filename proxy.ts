import { authService } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get('refreshToken')?.value

  const newAccessToken = await authService.refreshToken(refreshToken)

  // const h = new Headers(req.headers)
  // h.set('cookie', `${req.headers.get('cookie')}; accessToken=${newToken}`)
  // h.set('x-access-token', newToken) // الـ layout هياخده من هنا
  // const res = NextResponse.next({ request: { headers: h } })
  // res.cookies.set('accessToken', newToken, { httpOnly: true, path: '/' })
  // return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}

// await refreshToken()
// console.log('middleware')
// const headers = new Headers(request.headers)
// headers.set('x-access-token', accessToken)
//   return NextResponse.redirect(new URL('/home', request.url))
