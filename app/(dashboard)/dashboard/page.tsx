import { createClient } from '@/lib/supabase/server'
import { getBackendUrl } from '@/lib/backend'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

/** Dashboard: perfil y organización vía GET /api/me; insights y data_sources desde Supabase. */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  let profile: unknown = null
  let organization: unknown = null
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        profile = data.profile ?? null
        organization = data.organization ?? null
      }
    } catch {
      // Backend no disponible
    }
  }

  const orgId = (organization as { id?: string } | null)?.id ?? ''
  let insights: unknown[] = []
  let dataSources: unknown[] = []

  if (orgId) {
    const [insightsRes, dataSourcesRes] = await Promise.all([
      supabase.from('insights').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('data_sources').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
    ])
    if (insightsRes.data) insights = insightsRes.data
    if (dataSourcesRes.data) dataSources = dataSourcesRes.data
  }

  return (
    <DashboardClient
      profile={profile}
      organization={organization}
      businessContexts={[]}
      hasBusinessInfo={false}
      teamContexts={[]}
      dataSources={dataSources}
      reportSettings={null}
      organizationMembers={[]}
      insights={insights}
    />
  )
}

