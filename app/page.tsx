/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HowItWorks from '@/components/HowItWorks'

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const supabase = await createClient()
  const params = await searchParams

  // Fetch upcoming open matches
  let query = supabase
    .from('matches')
    .select(`
      *,
      organizer:profiles!organizer_id(first_name, last_name),
      players:match_players(role, canceled_at)
    `)
    .eq('status', 'open')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  // Apply filters
  if (params.sport) {
    query = query.eq('sport', params.sport)
  }
  if (params.zone) {
    query = query.eq('zone', params.zone)
  }

  const { data: matches } = await query

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-6 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in">
          Organizá partidos deportivos en segundos
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Creá partidos de fútbol, pádel y tenis en minutos. Encontrá jugadores cerca y coordiná todo en un solo lugar.
          <span className="text-blue-600 font-semibold"> ¡Sin complicaciones!</span>
        </p>
      </div>

      {/* How It Works Section */}
      <HowItWorks />
      
      <div className="max-w-6xl mx-auto px-4 pb-12">
        
        {/* Filters with modern pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Link 
            href="/" 
            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
              !params.sport 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            🏆 Todos
          </Link>
          <Link 
            href="/?sport=Fútbol 5" 
            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
              params.sport === 'Fútbol 5' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            ⚽ Fútbol 5
          </Link>
          <Link 
            href="/?sport=Pádel" 
            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
              params.sport === 'Pádel' 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300'
            }`}
          >
            🎾 Pádel
          </Link>
          <Link 
            href="/?sport=Tenis" 
            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
              params.sport === 'Tenis' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-300'
            }`}
          >
            🏸 Tenis
          </Link>
        </div>

        {matches && matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match: any) => {
              const activePlayers = match.players?.filter((p: any) => p.role === 'signed_up' && !p.canceled_at) || []
              const filledSlots = activePlayers.length
              const totalSlots = match.total_slots
              const isFull = filledSlots >= totalSlots
              
              // Check if match is today
              const matchDate = new Date(match.starts_at)
              const today = new Date()
              const isToday = matchDate.toDateString() === today.toDateString()

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden"
                >
                  {/* Status Badges */}
                  {isFull && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">
                      COMPLETO
                    </div>
                  )}
                  {isToday && !isFull && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10 animate-pulse">
                      HOY
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{match.sport === 'Fútbol 5' ? '⚽' : match.sport === 'Pádel' ? '🎾' : '🏸'}</span>
                        <span className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{match.sport}</span>
                      </div>
                      {match.padel_level && (
                        <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                          {match.padel_level}
                        </span>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-center min-w-[70px] ${
                      isFull 
                        ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200'
                    }`}>
                      <span className={`text-xl font-extrabold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                        {filledSlots}/{totalSlots}
                      </span>
                      <p className="text-[10px] text-gray-600 font-medium uppercase">cupos</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                      <span>📅</span>
                      <span className="capitalize">
                        {new Date(match.starts_at).toLocaleDateString('es-UY', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                      <span>🕐</span>
                      <span>
                        {new Date(match.starts_at).toLocaleTimeString('es-UY', {
                          hour: '2-digit', minute: '2-digit'
                        })} hs
                      </span>
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">📍</span>
                      <span className="font-semibold truncate">{match.zone}</span>
                    </div>
                    {match.price_per_person && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">💵</span>
                        <span className="font-bold text-green-600">${match.price_per_person}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    {match.organizer?.first_name ? (
                      <p className="text-xs text-gray-500">
                        Organiza: <span className="font-semibold text-gray-700">{match.organizer.first_name} {match.organizer.last_name}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-blue-600">Partido público</span>
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">⚽🎾🏸</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay partidos disponibles</h3>
            <p className="text-gray-600 text-lg mb-6">¡Sé el primero en crear uno!</p>
            <Link
              href="/matches/new"
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Crear el primer partido
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
