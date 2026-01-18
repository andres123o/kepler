import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const plan = requestUrl.searchParams.get('plan') || 'hobby'
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/register?error=${error.message}`)
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
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', data.user.id)
        .single()

      if (!existingOrg) {
        // Crear organización con el plan seleccionado
        const trialEndsAt = plan === 'hobby' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null

        await supabase
          .from('organizations')
          .insert({
            name: `${data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario'}'s Organization`,
            slug: `${data.user.id}-${Date.now()}`,
            owner_id: data.user.id,
            plan: plan as 'hobby' | 'startup' | 'growth',
            trial_ends_at: trialEndsAt,
            subscription_status: plan === 'hobby' ? 'trial' : 'active',
          })
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/register`)
}

