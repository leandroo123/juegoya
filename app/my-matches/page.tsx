/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MyMatchesClient from './MyMatchesClient'

export default async function MyMatchesPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/my-matches')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all matches where user is a player
  const { data: userMatches } = await supabase
    .from('match_players')
    .select(`
      match_id,
      role,
      joined_at,
      canceled_at,
      confirmed_at,
      match:matches(
        id,
        sport,
        starts_at,
        zone,
        location_text,
        total_slots,
        status,
        organizer_id,
        organizer:profiles!organizer_id(first_name, last_name)
      )
    `)
    .eq('user_id', user.id)
    .is('canceled_at', null)

  // Fetch matches organized by user
  const { data: organizedMatches } = await supabase
    .from('matches')
    .select(`
      id,
      sport,
      starts_at,
      zone,
      location_text,
      total_slots,
      status,
      organizer_id,
      organizer:profiles!organizer_id(first_name, last_name)
    `)
    .eq('organizer_id', user.id)

  // Calculate statistics
  const allMatches = [
    ...(userMatches?.map((um: any) => um.match).filter(Boolean) || []),
    ...(organizedMatches || [])
  ]

  const uniqueMatches = Array.from(
    new Map(allMatches.map((m: any) => [m.id, m])).values()
  )

  const pastMatches = uniqueMatches.filter((m: any) => 
    new Date(m.starts_at) < new Date() && m.status !== 'canceled'
  )

  const sports = [...new Set(pastMatches.map((m: any) => m.sport))]
  const sportCounts = sports.map(sport => ({
    sport,
    count: pastMatches.filter((m: any) => m.sport === sport).length
  }))
  const favoriteSport = sportCounts.sort((a, b) => b.count - a.count)[0]?.sport || 'N/A'

  const stats = {
    totalMatches: pastMatches.length,
    organizedMatches: organizedMatches?.length || 0,
    favoriteSport,
    sportsPlayed: sports.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-12">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100/50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mis Partidos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-extrabold text-blue-600 mb-2">{stats.totalMatches}</div>
            <p className="text-sm text-gray-600 font-medium">Partidos Jugados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-extrabold text-green-600 mb-2">{stats.organizedMatches}</div>
            <p className="text-sm text-gray-600 font-medium">Organizados</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl mb-2">{favoriteSport === 'Fútbol 5' ? '⚽' : favoriteSport === 'Pádel' ? '🎾' : '🏸'}</div>
            <p className="text-sm text-gray-600 font-medium">{favoriteSport}</p>
            <p className="text-xs text-gray-500">Favorito</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl font-extrabold text-purple-600 mb-2">{stats.sportsPlayed}</div>
            <p className="text-sm text-gray-600 font-medium">Deportes</p>
          </div>
        </div>

        {/* Matches List with Tabs */}
        <MyMatchesClient 
          userMatches={userMatches || []}
          organizedMatches={organizedMatches || []}
          userId={user.id}
        />
      </div>
    </div>
  )
}
