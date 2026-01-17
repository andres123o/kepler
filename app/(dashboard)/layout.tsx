import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener organización del usuario
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Si no tiene organización, crearla (fallback)
  if (!organization && profile) {
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: `${profile.full_name || 'Usuario'}'s Organization`,
        slug: `${user.id}-${Date.now()}`,
        owner_id: user.id,
        plan: 'hobby',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
      })
      .select()
      .single()

    if (newOrg) {
      return (
        <DashboardLayoutClient organization={newOrg} profile={profile}>
          {children}
        </DashboardLayoutClient>
      )
    }
  }

  return (
    <DashboardLayoutClient 
      organization={organization || null} 
      profile={profile || null}
    >
      {children}
    </DashboardLayoutClient>
  )
}

