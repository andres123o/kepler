import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Función helper para obtener la URL base correcta
function getBaseUrl(requestUrl: URL): string {
  // En producción, usar la URL de producción
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Si estamos en producción (no localhost), usar iskepler.com
  if (requestUrl.hostname !== 'localhost' && !requestUrl.hostname.includes('127.0.0.1')) {
    return 'https://www.iskepler.com'
  }
  // En desarrollo local, usar el origin de la request
  return requestUrl.origin
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const plan = requestUrl.searchParams.get('plan') || 'hobby'
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const baseUrl = getBaseUrl(requestUrl)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.user) {
      // Verificar si ya tiene perfil y organización
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        // El perfil debería crearse automáticamente por el trigger
        // Si no existe, esperamos un momento y verificamos de nuevo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar nuevamente
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // Si aún no existe, crearlo manualmente (fallback)
        if (!profileCheck) {
          // @ts-ignore - Supabase types issue
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            } as any)
        }
      }

      // Verificar si ya tiene organización
      // La organización debería haberse creado inmediatamente después del registro
      // Si no existe, crearla con datos básicos (fallback)
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('owner_id', data.user.id)
        .single()

      if (!existingOrg) {
        // Fallback: crear organización básica si no se creó inmediatamente
        const orgName = `${data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario'}'s Organization`
        const trialEndsAt = plan === 'hobby' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null

        // @ts-ignore - Supabase types issue
        await supabase
          .from('organizations')
          .insert({
            name: orgName,
            slug: `${data.user.id}-${Date.now()}`,
            owner_id: data.user.id,
            plan: plan as 'hobby' | 'startup' | 'growth',
            trial_ends_at: trialEndsAt,
            subscription_status: plan === 'hobby' ? 'trial' : 'active',
          } as any)
      }
    }

    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  return NextResponse.redirect(`${baseUrl}/login`)
}

