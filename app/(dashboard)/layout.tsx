import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBackendUrl } from '@/lib/backend'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

/** Dashboard: Auth en frontend; perfil y organización vía GET /api/me del backend. */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
      // Backend no disponible o error de red; se muestran null
    }
  }

  return (
    <DashboardLayoutClient organization={organization} profile={profile}>
      {children}
    </DashboardLayoutClient>
  )
}

