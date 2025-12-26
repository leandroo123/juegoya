import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error during exchange:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message || 'otp_failed')}`)
    }
  }

  // Determine redirect destination
  let destination = `${origin}/home`

  // If redirect parameter exists, validate it's an internal route
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    destination = `${origin}${redirect}`
  }

  // Successful login, redirect to destination
  return NextResponse.redirect(destination)
}
