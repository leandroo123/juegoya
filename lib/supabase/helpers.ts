import type { Database } from '../types'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Helper to check if profile is complete
export async function isProfileComplete(userId: string): Promise<boolean> {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, whatsapp')
    .eq('id', userId)
    .single()

  if (!profile) return false

  return !!(profile.first_name && profile.last_name && profile.whatsapp)
}
