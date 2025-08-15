import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

export function middleware(request: NextRequest) {
  // Only protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token with Edge Runtime compatible function
    const decoded = verifyTokenEdge(token, process.env.JWT_SECRET || '')
    if (!decoded) {
      // Redirect to login if invalid token
      const response = NextResponse.redirect(new URL('/login', request.url))
      // Clear invalid token
      response.cookies.delete('auth-token')
      return response
    }

    // Add user info to request headers for the protected route
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId.toString())
    response.headers.set('x-user-email', decoded.email)
    return response
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    const token = request.cookies.get('auth-token')?.value
    
    if (token && verifyTokenEdge(token, process.env.JWT_SECRET || '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
