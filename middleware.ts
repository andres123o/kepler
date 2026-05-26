import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('kepler-session')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/app') && session !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/login' && session === 'authenticated') {
    return NextResponse.redirect(new URL('/app/ingresar', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/login'],
}
