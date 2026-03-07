import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/** En localhost siempre redirigir al mismo origen para que el primer GET /api/me sea al backend de dev. */
function getBaseUrl(requestUrl: URL): string {
  const hostname = requestUrl.hostname
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) return requestUrl.origin
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.iskepler.com'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const baseUrl = getBaseUrl(requestUrl)

  const supabase = await createClient()

  // OAuth: code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
    }
    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  // Email OTP (recuperación de contraseña, etc.): token_hash + type
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
    }
    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  return NextResponse.redirect(`${baseUrl}/login`)
}

