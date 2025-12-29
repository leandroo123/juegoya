import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
// import type { Match, MatchPlayer, Profile } from '@/lib/types' // Temporarily commented
import MatchesClient from './MatchesClient'

type MatchWithDetails = Match & {
  organizer: Pick<Profile, 'first_name' | 'last_name'> | null
  players: Pick<MatchPlayer, 'role' | 'canceled_at'>[]
}

export default async function MatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if profile is complete (only for authenticated users)
  let isProfileComplete = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, whatsapp')
      .eq('id', user.id)
      .single()

    const typedProfile = profile as { first_name: string | null; last_name: string | null; whatsapp: string | null } | null
    isProfileComplete = !!(typedProfile?.first_name && typedProfile?.last_name && typedProfile?.whatsapp)
  }

  // Fetch upcoming open matches (public, no auth required)
  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      organizer:profiles!organizer_id(first_name, last_name),
      players:match_players(role, canceled_at)
    `)
    .eq('status', 'open')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  const matches = matchesData as unknown as MatchWithDetails[] | null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-8">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100/50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Partidos</h1>
          </div>
          <Link
            href="/matches/new"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold py-2.5 px-5 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            + Crear
          </Link>
        </div>
      </div>
      
      <MatchesClient matches={matches} isProfileComplete={isProfileComplete} />
    </div>
  )
}
