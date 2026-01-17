import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Obtener organización
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!organization) {
    return null
  }

  const orgData = organization as { id: string; [key: string]: any };
  const orgId = orgData.id;

  // Verificar si tiene información de negocio configurada
  const { data: businessContexts } = await supabase
    .from('business_context')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  const hasBusinessInfo = !!(businessContexts && businessContexts.length > 0)

  // Obtener contextos del equipo
  const { data: teamContexts } = await supabase
    .from('team_context')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // Obtener fuentes de datos
  const { data: dataSources } = await supabase
    .from('data_sources')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // Obtener configuración de reportes
  const { data: reportSettings, error: reportSettingsError } = await supabase
    .from('report_settings')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle()
  
  console.log('[DashboardPage Server] organization.id:', orgId);
  console.log('[DashboardPage Server] reportSettings:', reportSettings);
  console.log('[DashboardPage Server] reportSettingsError:', reportSettingsError);

  // Obtener miembros de la organización
  const { data: organizationMembers } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // Obtener progreso de onboarding
  const { data: onboardingProgress } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('organization_id', orgId)
    .maybeSingle() // Usar maybeSingle en lugar de single para manejar cuando no existe

  // Obtener insights
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('organization_id', orgId)
    .order('generated_at', { ascending: false })

  return (
    <DashboardClient
      organization={organization}
      onboardingProgress={onboardingProgress}
      businessContexts={businessContexts || []}
      hasBusinessInfo={hasBusinessInfo}
      teamContexts={teamContexts || []}
      dataSources={dataSources || []}
      reportSettings={reportSettings}
      organizationMembers={organizationMembers || []}
      insights={insights || []}
    />
  )
}

