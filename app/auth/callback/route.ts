import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchCompanyContext } from '@/app/actions/fetch-company-context'
import { generateFirstAnalysis } from '@/app/actions/generate-first-analysis'

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
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('owner_id', data.user.id)
        .single()

      let organization = existingOrg as any

      if (!existingOrg) {
        // Obtener datos del registro desde user_metadata
        const companyName = data.user.user_metadata?.company_name || ''
        const instagramUsername = data.user.user_metadata?.instagram_username || ''
        const playStoreUrl = data.user.user_metadata?.playstore_url || ''
        const registrationPlan = data.user.user_metadata?.registration_plan || plan

        // Crear organización con el plan seleccionado
        const trialEndsAt = registrationPlan === 'hobby' 
          ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null

        // Usar nombre de empresa si está disponible, sino usar el nombre completo
        const orgName = companyName.trim() || `${data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Usuario'}'s Organization`

        // @ts-ignore - Supabase types issue
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            slug: `${data.user.id}-${Date.now()}`,
            owner_id: data.user.id,
            plan: registrationPlan as 'hobby' | 'startup' | 'growth',
            trial_ends_at: trialEndsAt,
            subscription_status: registrationPlan === 'hobby' ? 'trial' : 'active',
          } as any)
          .select('id, name')
          .single()

        if (!orgError && newOrg) {
          organization = newOrg as any

          // Crear data_sources si se proporcionaron datos
          if (instagramUsername.trim() || playStoreUrl.trim()) {
            const dataSourcesToCreate: any[] = []
            
            // Instagram data source
            if (instagramUsername.trim()) {
              const cleanInstagram = instagramUsername.trim().replace(/^@/, '').replace(/\s+/g, '')
              dataSourcesToCreate.push({
                organization_id: organization.id,
                source_type: 'social',
                source_name: 'Instagram',
                social_platform: 'instagram',
                social_username: cleanInstagram,
                uploaded_by: data.user.id,
              })
            }
            
            // Play Store data source
            if (playStoreUrl.trim()) {
              dataSourcesToCreate.push({
                organization_id: organization.id,
                source_type: 'app_store',
                source_name: 'Play Store',
                app_store_type: 'play_store',
                app_url: playStoreUrl.trim(),
                uploaded_by: data.user.id,
              })
            }
            
            // Insertar data sources
            if (dataSourcesToCreate.length > 0) {
              // @ts-ignore
              await supabase
                .from('data_sources')
                .insert(dataSourcesToCreate as any)
            }
          }

          // Ejecutar generación de primer análisis en background (no bloquea)
          // Esto ejecuta: scraping de contexto empresa + Instagram + Play Store + análisis automático
          if (companyName.trim()) {
            generateFirstAnalysis(
              organization.id,
              companyName.trim(),
              data.user.id,
              instagramUsername.trim() || undefined,
              playStoreUrl.trim() || undefined
            )
              .then((result) => {
                if (result.success) {
                  console.log(`✅ Primer análisis generado exitosamente desde callback: ${result.insightId}`)
                } else {
                  console.error(`⚠️ Error al generar primer análisis desde callback: ${result.error}`)
                }
              })
              .catch((error) => {
                console.error('⚠️ Error al ejecutar generateFirstAnalysis desde callback:', error)
              })
          }
        }
      }
    }

    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  return NextResponse.redirect(`${baseUrl}/login`)
}

