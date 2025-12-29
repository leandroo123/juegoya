'use client'

import { useState } from 'react'
import Link from 'next/link'
// import type { Match, MatchPlayer, Profile } from '@/lib/types' // Temporarily commented
import SportFilter from './SportFilter'

type MatchWithDetails = Match & {
  organizer: Pick<Profile, 'first_name' | 'last_name'> | null
  players: Pick<MatchPlayer, 'role' | 'canceled_at'>[]
}

interface MatchesClientProps {
  matches: MatchWithDetails[] | null
  isProfileComplete: boolean
}

export default function MatchesClient({ matches, isProfileComplete }: MatchesClientProps) {
  const [selectedSport, setSelectedSport] = useState('all')

  const filteredMatches = matches?.filter((match) => 
    selectedSport === 'all' || match.sport === selectedSport
  ) || []

  return (
    <div className="max-w-6xl mx-auto px-4 mt-6 pb-12">
      {!isProfileComplete && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8 shadow-md">
          <p className="text-yellow-900 font-bold text-lg mb-2">
            ⚠️ Completá tu perfil para crear o unirte a partidos
          </p>
          <Link
            href="/profile"
            className="inline-block bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mt-2"
          >
            Completar perfil →
          </Link>
        </div>
      )}

      <div className="mb-8">
        <SportFilter selectedSport={selectedSport} onSelectSport={setSelectedSport} />
      </div>

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => {
            const activePlayers = match.players?.filter((p) => p.role === 'signed_up' && !p.canceled_at) || []
            const filledSlots = activePlayers.length
            const totalSlots = match.total_slots
            const matchId = match.id
            const isFull = filledSlots >= totalSlots

            return (
              <Link
                key={matchId}
                href={`/matches/${matchId}`}
                className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{match.sport === 'Fútbol 5' ? '⚽' : match.sport === 'Pádel' ? '🎾' : '🏸'}</span>
                      <h2 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{match.sport}</h2>
                    </div>
                    {match.sport === 'Pádel' && match.padel_level && (
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
                    <div className={`text-xl font-extrabold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                      {filledSlots}/{totalSlots}
                    </div>
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
                        month: 'short',
                      })}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                    <span>🕐</span>
                    <span>
                      {new Date(match.starts_at).toLocaleTimeString('es-UY', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} hs
                    </span>
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-lg">📍</span>
                    <span className="font-semibold truncate">{match.zone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-lg">🏟️</span>
                    <span className="truncate">{match.location_text}</span>
                  </div>
                  {match.price_per_person && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">💵</span>
                      <span className="font-bold text-green-600">${match.price_per_person}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Organiza: <span className="font-semibold text-gray-700">{match.organizer?.first_name} {match.organizer?.last_name}</span>
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-6xl mb-4">🏟️</div>
          <p className="text-gray-600 text-lg mb-6">
            {selectedSport === 'all' 
              ? 'No hay partidos disponibles' 
              : `No hay partidos de ${selectedSport} disponibles`}
          </p>
          <Link
            href="/matches/new"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Crear el primer partido
          </Link>
        </div>
      )}
    </div>
  )
}
