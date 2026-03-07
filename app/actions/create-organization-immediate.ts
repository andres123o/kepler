'use server'

import { createClient } from '@/lib/supabase/server'
import { getBackendUrl } from '@/lib/backend'

export type CreateOrganizationResult =
  | { success: true; organizationId: string }
  | { success: false; error: string }

/**
 * Crea la organización (vía GET /api/me) y persiste en Supabase las fuentes de datos
 * del segundo formulario. Solo tiene efecto con sesión activa (ej. registro sin confirmación de email).
 * Con confirmación de email, las fuentes se crean en el backend en el primer GET /api/me.
 */
export async function createOrganizationImmediate(
  _userId: string,
  _companyName: string,
  websiteUrl: string,
  instagramUsername?: string,
  playStoreUrl?: string,
  appStoreUrl?: string,
  _plan?: string
): Promise<CreateOrganizationResult> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return {
      success: false,
      error:
        'No hay sesión activa. Si tienes que confirmar el email, podrás añadir tus fuentes desde el dashboard al iniciar sesión.',
    }
  }

  try {
    const meRes = await fetch(`${getBackendUrl()}/api/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    })
    if (!meRes.ok) {
      return {
        success: false,
        error: 'No se pudo obtener la organización. Vuelve a intentar desde el dashboard.',
      }
    }
    const meData = await meRes.json()
    const orgId = meData?.organization?.id
    if (!orgId) {
      return {
        success: false,
        error: 'Organización no encontrada. Vuelve a intentar desde el dashboard.',
      }
    }

    const rows: Array<Record<string, unknown>> = []

    if (websiteUrl?.trim()) {
      rows.push({
        organization_id: orgId,
        source_type: 'website',
        source_name: 'Sitio Web',
        website_url: websiteUrl.trim(),
      })
    }

    const instagramUser = instagramUsername?.trim()?.replace(/^@/, '')
    if (instagramUser) {
      rows.push({
        organization_id: orgId,
        source_type: 'social',
        source_name: 'Instagram',
        social_platform: 'instagram',
        social_username: instagramUser,
      })
    }

    if (playStoreUrl?.trim()) {
      rows.push({
        organization_id: orgId,
        source_type: 'app_store',
        source_name: 'Play Store',
        app_store_type: 'play_store',
        app_url: playStoreUrl.trim(),
      })
    }

    if (appStoreUrl?.trim()) {
      rows.push({
        organization_id: orgId,
        source_type: 'app_store',
        source_name: 'App Store',
        app_store_type: 'app_store',
        app_url: appStoreUrl.trim(),
      })
    }

    if (rows.length === 0) {
      return { success: true, organizationId: orgId }
    }

    const { error } = await supabase.from('data_sources').insert(rows)

    if (error) {
      return {
        success: false,
        error: `Error al guardar fuentes de datos: ${error.message}`,
      }
    }

    return { success: true, organizationId: orgId }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error inesperado'
    return {
      success: false,
      error: message,
    }
  }
}
