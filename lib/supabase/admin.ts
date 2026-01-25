import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

/**
 * Cliente de Supabase con Service Role Key
 * Bypass RLS - Solo usar en Server Actions
 * NUNCA exponer al cliente
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurado')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

