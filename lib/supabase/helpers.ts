import type { Database } from '../types'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type ProfileCore = {
  first_name: string | null
  last_name: string | null
  whatsapp: string | null
}

// Helper to check if profile is complete
export async function isProfileComplete(userId: string): Promise<boolean> {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name,last_name,whatsapp')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error leyendo profiles en isProfileComplete:', error)
    return false
  }

  const profile = data as unknown as ProfileCore | null
  if (!profile) return false

  return Boolean(profile.first_name && profile.last_name && profile.whatsapp)
}
