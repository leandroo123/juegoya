/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatchActions from './MatchActions'
import ShareButton from './ShareButton'
import DeleteMatchButton from './DeleteMatchButton'
import ConfirmAttendanceButton from './ConfirmAttendanceButton'
import CountdownTimer from './CountdownTimer'
import ConfettiEffect from './ConfettiEffect'
import BackHeader from '@/components/BackHeader'
import Link from 'next/link'

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap async params (Next.js 16+)
  const { id } = await params
  
  const supabase = await createClient()

  // STEP 1: Fetch match data (public, always works)
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select(`
      *,
      organizer:profiles!organizer_id(first_name, last_name, whatsapp)
    `)
    .eq('id', id)
    .single()

  if (matchError || !match) {
    notFound()
  }

  // Check if match is canceled or finished
  const matchStatus = (match as any).status
  const isCanceled = matchStatus === 'canceled'
  const isFinished = matchStatus === 'finished'

  // STEP 2: Get current user (may be null for public access)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // STEP 3: Load roster ONLY if user is authenticated (defensive)
  let players: any[] = []
  let rosterError = null

  if (user) {
    try {
      const { data: playersData, error: playersErr } = await supabase
        .from('match_players')
        .select(`
          user_id,
          role,
          joined_at,
          canceled_at,
          confirmed_at,
          profile:profiles(first_name, last_name)
        `)
        .eq('match_id', id)

      if (playersErr) {
        console.error('Error loading roster:', playersErr)
        rosterError = playersErr.message
      } else {
        players = playersData || []
      }
    } catch (err) {
      console.error('Exception loading roster:', err)
      rosterError = 'Error al cargar jugadores'
    }
  }

  // Calculate slots
  const activePlayers = players.filter(
    (p: any) => p.role === 'signed_up' && !p.canceled_at
  )
  const substitutes = players.filter(
    (p: any) => p.role === 'substitute' && !p.canceled_at
  )
  const confirmedPlayers = activePlayers.filter((p: any) => p.confirmed_at)
  const filledSlots = activePlayers.length
  const totalSlots = (match as any).total_slots
  const isFull = filledSlots >= totalSlots

  // User's participation status
  const userParticipation = user
    ? players.find((p: any) => p.user_id === user.id && !p.canceled_at)
    : null

  // Check if profile is complete (for authenticated users)
  let isProfileComplete = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, whatsapp')
      .eq('id', user.id)
      .single()

    isProfileComplete = !!(profile && (profile as any).first_name && (profile as any).last_name && (profile as any).whatsapp)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <ConfettiEffect isFull={isFull} totalSlots={totalSlots} />
      <BackHeader title={(match as any).sport} destination="/matches" />
      
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{(match as any).sport}</h1>
              <p className="text-lg text-gray-600">
                {new Date((match as any).starts_at).toLocaleDateString('es-UY', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                a las{' '}
                {new Date((match as any).starts_at).toLocaleTimeString('es-UY', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="mt-3">
                <CountdownTimer startsAt={(match as any).starts_at} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-600">
                {filledSlots}/{totalSlots}
              </div>
              <p className="text-sm text-gray-500">cupos</p>
              {isFull && (
                <p className="text-green-600 font-semibold text-sm mt-1">¡Completo! 🎉</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold">Zona</p>
                <p>{(match as any).zone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">🏟️</span>
              <div>
                <p className="font-semibold">Lugar</p>
                <p>{(match as any).location_text}</p>
              </div>
            </div>
            {(match as any).price_per_person && (
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold">Precio</p>
                  <p>${(match as any).price_per_person} por persona</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700">
              <span className="text-2xl">👤</span>
              <div>
                <p className="font-semibold">Organiza</p>
                <p>
                  {(match as any).organizer?.first_name} {(match as any).organizer?.last_name}
                </p>
              </div>
            </div>
            
            {/* Nivel Padel */}
            {(match as any).padel_level && (
               <div className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🎾</span>
                <div>
                  <p className="font-semibold">Nivel</p>
                  <p>{(match as any).padel_level}</p>
                </div>
              </div>
            )}
          </div>

          {/* Share button */}
          <ShareButton matchId={id} sport={(match as any).sport} />
        </div>

        {/* Actions / Login CTA */}
        {isCanceled || isFinished ? (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center mb-6">
            <p className="text-gray-700 font-medium">
              {isCanceled ? '❌ Este partido fue cancelado' : '✓ Este partido ya finalizó'}
            </p>
          </div>
        ) : !user ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
            <p className="text-blue-900 font-medium mb-3">
              Iniciá sesión para anotarte a este partido
            </p>
            <Link
              href={`/login?redirect=/matches/${id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : !isProfileComplete ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
            <p className="text-yellow-800 font-medium mb-3">
              Completá tu perfil para unirte a partidos
            </p>
            <Link
              href={`/profile/edit?redirect=/matches/${id}`}
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Completar perfil
            </Link>
          </div>
        ) : (
          <MatchActions
            matchId={id}
            isFull={isFull}
            userParticipation={userParticipation}
            matchStatus={matchStatus}
            matchSport={(match as any).sport}
            matchPadelLevel={(match as any).padel_level}
          />
        )}

        {/* Confirmation button (only for signed up players) */}
        {user && userParticipation && (
          <div className="mb-6">
            <ConfirmAttendanceButton 
              matchId={id}
              matchStartsAt={(match as any).starts_at}
              isConfirmed={!!userParticipation.confirmed_at}
              userParticipation={userParticipation}
            />
          </div>
        )}

        {/* Delete button (only for organizer) */}
        {user && (match as any).organizer_id === user.id && !isCanceled && !isFinished && (
          <div className="mb-6">
            <DeleteMatchButton matchId={id} isOrganizer={true} />
          </div>
        )}


        {/* Player roster (only for authenticated users) */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Jugadores</h2>

            {rosterError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No pudimos cargar la lista de jugadores. Intentá refrescar la página.
                </p>
              </div>
            )}

            {/* Titulares */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Titulares ({filledSlots}/{totalSlots})
                </h3>
                <span className="text-sm font-medium text-green-600">
                  ✓ {confirmedPlayers.length} confirmados
                </span>
              </div>
              {activePlayers.length > 0 ? (
                <ul className="space-y-2">
                  {activePlayers.map((player: any, index: number) => (
                    <li key={player.user_id} className="flex items-center gap-3 text-gray-700">
                      <span className="font-medium">{index + 1}.</span>
                      <a href={`/players/${player.user_id}`} className="hover:text-blue-600 hover:underline">
                        {player.profile?.first_name} {player.profile?.last_name}
                      </a>
                      {player.confirmed_at && (
                        <span className="text-green-600 text-sm">✓ Confirmado</span>
                      )}
                      
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No hay titulares anotados</p>
              )}
            </div>

            {/* Suplentes */}
            {substitutes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Suplentes ({substitutes.length})
                </h3>
                <ul className="space-y-2">
                  {substitutes.map((player: any, index: number) => (
                    <li key={player.user_id} className="flex items-center gap-3 text-gray-600">
                      <span className="font-medium">{index + 1}.</span>
                      <a href={`/players/${player.user_id}`} className="hover:text-blue-600 hover:underline">
                        {player.profile?.first_name} {player.profile?.last_name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
