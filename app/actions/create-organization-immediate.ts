'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { generateFirstAnalysis } from './generate-first-analysis'

/**
 * Crea la organización y data sources inmediatamente después del registro
 * Usa Service Role Key para bypass RLS (el usuario aún no tiene sesión activa)
 * Se ejecuta en background, no bloquea el flujo
 */
export async function createOrganizationImmediate(
  userId: string,
  companyName: string,
  instagramUsername?: string,
  playStoreUrl?: string,
  plan: string = 'hobby'
) {
  console.log(`🚀 Creando organización inmediatamente para usuario: ${userId}`)
  
  try {
    const supabase = createAdminClient()

    // 1. Verificar si ya existe organización (por si se llama dos veces)
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', userId)
      .single()

    if (existingOrg) {
      const org = existingOrg as any
      console.log(`✅ Organización ya existe: ${org.id}`)
      return { success: true, organizationId: org.id, alreadyExists: true }
    }

    // 2. Crear organización
    const orgName = companyName.trim() || "Mi Organización"
    const trialEndsAt = plan === 'hobby' 
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      : null

    // @ts-ignore - Supabase types issue with admin client
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        slug: `${userId}-${Date.now()}`,
        owner_id: userId,
        plan: plan as 'hobby' | 'startup' | 'growth',
        trial_ends_at: trialEndsAt,
        subscription_status: plan === 'hobby' ? 'trial' : 'active',
      } as any)
      .select('id, name')
      .single()

    if (orgError) {
      console.error('❌ Error creando organización:', orgError)
      throw orgError
    }

    const org = organization as any
    if (!org || !org.id) {
      throw new Error('No se pudo crear la organización')
    }

    console.log(`✅ Organización creada: ${org.id}`)

    // 3. Crear data sources si se proporcionaron datos
    if (instagramUsername?.trim() || playStoreUrl?.trim()) {
      const dataSourcesToCreate: any[] = []
      
      // Instagram data source
      if (instagramUsername?.trim()) {
        const cleanInstagram = instagramUsername.trim().replace(/^@/, '').replace(/\s+/g, '')
        dataSourcesToCreate.push({
          organization_id: org.id,
          source_type: 'social',
          source_name: 'Instagram',
          social_platform: 'instagram',
          social_username: cleanInstagram,
          uploaded_by: userId,
        })
      }
      
      // Play Store data source
      if (playStoreUrl?.trim()) {
        dataSourcesToCreate.push({
          organization_id: org.id,
          source_type: 'app_store',
          source_name: 'Play Store',
          app_store_type: 'play_store',
          app_url: playStoreUrl.trim(),
          uploaded_by: userId,
        })
      }
      
      // Insertar data sources
      if (dataSourcesToCreate.length > 0) {
        // @ts-ignore - Supabase types issue with admin client
        const { error: sourcesError } = await supabase
          .from('data_sources')
          .insert(dataSourcesToCreate as any)

        if (sourcesError) {
          console.error('⚠️ Error creando data sources:', sourcesError)
          // No lanzar error, continuar con el análisis
        } else {
          console.log(`✅ Data sources creados: ${dataSourcesToCreate.length}`)
        }
      }
    }

    // 4. Ejecutar generación de primer análisis en background (no bloquea)
    if (companyName.trim()) {
      generateFirstAnalysis(
        org.id,
        companyName.trim(),
        userId,
        instagramUsername?.trim() || undefined,
        playStoreUrl?.trim() || undefined
      )
        .then((result) => {
          if (result.success) {
            console.log(`✅ Primer análisis generado exitosamente: ${result.insightId}`)
          } else {
            console.error(`⚠️ Error al generar primer análisis: ${result.error}`)
          }
        })
        .catch((error) => {
          console.error('⚠️ Error al ejecutar generateFirstAnalysis:', error)
        })
    }

    return {
      success: true,
      organizationId: org.id,
      alreadyExists: false,
    }
  } catch (error: any) {
    console.error('❌ Error en createOrganizationImmediate:', error.message)
    return {
      success: false,
      error: error.message || 'Error desconocido',
    }
  }
}

