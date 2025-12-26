import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes that don't require profile completion
  const profileExemptRoutes = ['/login', '/profile', '/api/auth/callback', '/', '/matches']
  const isProfileExempt = profileExemptRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )
  // /matches/[id] is public and doesn't require profile
  const isMatchDetailRoute = /^\/matches\/[^\/]+$/.test(request.nextUrl.pathname)

  // Protected routes (require auth)
  const protectedRoutes = ['/profile', '/matches/new', '/players', '/home']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Explicitly protect specific actions or pages if needed, but allow public browsing
  // matches list and detail should be public
  const needsAuth = isProtectedRoute

  // Helper function to handle redirects while preserving cookies
  const safeRedirect = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.searchParams.set('redirect', request.nextUrl.pathname)
    
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy cookies from supabaseResponse (which might contain refreshed session)
    const newCookies = supabaseResponse.cookies.getAll()
    newCookies.forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    
    return redirectResponse
  }

  // Protected routes check
  if (needsAuth && !user) {
    return safeRedirect('/login')
  }

  // Check profile completion for authenticated users on non-exempt routes
  if (user && !isProfileExempt && !isMatchDetailRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, whatsapp')
      .eq('id', user.id)
      .single()

    const isComplete = !!(profile?.first_name && profile?.last_name && profile?.whatsapp)

    if (!isComplete) {
      return safeRedirect('/profile/edit')
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - google*.html (Google Search Console verification)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|google.*\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
