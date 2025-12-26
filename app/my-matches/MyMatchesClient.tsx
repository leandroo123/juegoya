'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MyMatchesClientProps {
  userMatches: any[]
  organizedMatches: any[]
  userId: string
}

export default function MyMatchesClient({ userMatches, organizedMatches, userId }: MyMatchesClientProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'organized'>('upcoming')

  // Process matches
  const now = new Date()
  
  const upcomingMatches = userMatches
    .map((um: any) => um.match)
    .filter((m: any) => m && new Date(m.starts_at) > now && m.status === 'open')
    .sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

  const pastMatches = userMatches
    .map((um: any) => um.match)
    .filter((m: any) => m && (new Date(m.starts_at) < now || m.status === 'finished'))
    .sort((a: any, b: any) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  const organized = organizedMatches
    .filter((m: any) => m && m.status !== 'canceled')
    .sort((a: any, b: any) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  const renderMatches = (matches: any[]) => {
    if (matches.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-6xl mb-4">🏟️</div>
          <p className="text-gray-600 text-lg mb-6">No hay partidos en esta categoría</p>
          <Link
            href="/matches"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Ver partidos disponibles
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match: any) => (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{match.sport === 'Fútbol 5' ? '⚽' : match.sport === 'Pádel' ? '🎾' : '🏸'}</span>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">{match.sport}</h3>
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

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">📍</span>
                <span className="font-semibold truncate">{match.zone}</span>
              </div>
              {match.organizer_id === userId && (
                <div className="mt-2">
                  <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                    👑 Organizador
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
            activeTab === 'upcoming'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
          }`}
        >
          📅 Próximos ({upcomingMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
            activeTab === 'past'
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          ✓ Pasados ({pastMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('organized')}
          className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 ${
            activeTab === 'organized'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
          }`}
        >
          👑 Organizados ({organized.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && renderMatches(upcomingMatches)}
      {activeTab === 'past' && renderMatches(pastMatches)}
      {activeTab === 'organized' && renderMatches(organized)}
    </div>
  )
}
