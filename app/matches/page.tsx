import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if profile is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, whatsapp')
    .eq('id', user.id)
    .single()

  const isProfileComplete = !!(profile && (profile as any).first_name && (profile as any).last_name && (profile as any).whatsapp)

  // Fetch upcoming open matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      organizer:profiles!organizer_id(first_name, last_name),
      players:match_players(role, canceled_at)
    `)
    .eq('status', 'open')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Partidos</h1>
          <Link
            href="/matches/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Crear partido
          </Link>
        </div>

        {!isProfileComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              ⚠️ Completá tu perfil para crear o unirte a partidos
            </p>
            <Link
              href="/profile"
              className="text-yellow-900 underline hover:text-yellow-700 text-sm mt-1 inline-block"
            >
              Ir a mi perfil →
            </Link>
          </div>
        )}

        {matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match: any) => {
              const activePlayers = match.players?.filter((p: any) => p.role === 'signed_up' && !p.canceled_at) || []
              const filledSlots = activePlayers.length
              const totalSlots = match.total_slots

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{match.sport}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(match.starts_at).toLocaleDateString('es-UY', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}{' '}
                        a las{' '}
                        {new Date(match.starts_at).toLocaleTimeString('es-UY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {filledSlots}/{totalSlots}
                      </div>
                      <p className="text-xs text-gray-500">cupos</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">📍</span> {match.zone}
                    </div>
                    <div>
                      <span className="font-medium">🏟️</span> {match.location_text}
                    </div>
                    {match.price_per_person && (
                      <div>
                        <span className="font-medium">💵</span> ${match.price_per_person}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Organiza: {match.organizer?.first_name} {match.organizer?.last_name}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No hay partidos disponibles</p>
            <Link
              href="/matches/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Crear el primer partido
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
