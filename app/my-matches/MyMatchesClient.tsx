'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type MatchStatus = 'open' | 'finished' | 'canceled' | string

type MatchView = {
  id: string
  sport: string
  starts_at: string
  status: MatchStatus
  organizer_id: string
  zone?: string | null
}

type UserMatchIncoming = {
  match: unknown // puede ser objeto, array, null...
}

interface MyMatchesClientProps {
  userMatches: UserMatchIncoming[] // aceptamos “lo que venga”
  organizedMatches: unknown[] // aceptamos “lo que venga”
  userId: string
}

function safeDate(value: string): Date | null {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function asString(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return null
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/**
 * Convierte match "sucio" (objeto o array o cualquier cosa) a MatchView o null.
 * Esto evita que el componente dependa del shape exacto de Supabase.
 */
function normalizeMatch(raw: unknown): MatchView | null {
  const m = Array.isArray(raw) ? raw[0] : raw
  if (!isRecord(m)) return null

  const id = asString(m.id)
  const sport = asString(m.sport)
  const starts_at = asString(m.starts_at)
  const status = asString(m.status)
  const organizer_id = asString(m.organizer_id)

  if (!id || !sport || !starts_at || !status || !organizer_id) return null

  const zoneVal = isRecord(m) ? (m.zone ?? null) : null
  const zone = typeof zoneVal === 'string' ? zoneVal : zoneVal == null ? null : String(zoneVal)

  return {
    id,
    sport,
    starts_at,
    status,
    organizer_id,
    zone,
  }
}

export default function MyMatchesClient({
  userMatches,
  organizedMatches,
  userId,
}: MyMatchesClientProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'organized'>('upcoming')

  const now = useMemo(() => new Date(), [])

  const normalizedUserMatches = useMemo(() => {
    return (userMatches ?? []).map((um) => ({
      match: normalizeMatch(isRecord(um) ? um.match : null),
    }))
  }, [userMatches])

  const normalizedOrganizedMatches = useMemo(() => {
    return (organizedMatches ?? [])
      .map((m) => normalizeMatch(m))
      .filter((m): m is MatchView => !!m)
  }, [organizedMatches])

  const upcomingMatches = useMemo(() => {
    return normalizedUserMatches
      .map((um) => um.match)
      .filter((m): m is MatchView => {
        if (!m) return false
        const d = safeDate(m.starts_at)
        return !!d && d > now && m.status === 'open'
      })
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0
        const db = safeDate(b.starts_at)?.getTime() ?? 0
        return da - db
      })
  }, [normalizedUserMatches, now])

  const pastMatches = useMemo(() => {
    return normalizedUserMatches
      .map((um) => um.match)
      .filter((m): m is MatchView => {
        if (!m) return false
        const d = safeDate(m.starts_at)
        return !d || d < now || m.status === 'finished'
      })
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0
        const db = safeDate(b.starts_at)?.getTime() ?? 0
        return db - da
      })
  }, [normalizedUserMatches, now])

  const organized = useMemo(() => {
    return normalizedOrganizedMatches
      .filter((m) => m.status !== 'canceled')
      .sort((a, b) => {
        const da = safeDate(a.starts_at)?.getTime() ?? 0
        const db = safeDate(b.starts_at)?.getTime() ?? 0
        return db - da
      })
  }, [normalizedOrganizedMatches])

  const renderMatches = (matches: MatchView[]) => {
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
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">
                {match.sport === 'Fútbol 5' ? '⚽' : match.sport === 'Pádel' ? '🎾' : '🏸'}
              </span>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                {match.sport}
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                <span>📅</span>
                <span className="capitalize">
                  {safeDate(match.starts_at)?.toLocaleDateString('es-UY', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  }) ?? 'Fecha a confirmar'}
                </span>
              </p>
              <p className="text-gray-600 text-sm font-medium flex items-center gap-2">
                <span>🕐</span>
                <span>
                  {safeDate(match.starts_at)?.toLocaleTimeString('es-UY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) ?? '--:--'}{' '}
                  hs
                </span>
              </p>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-lg">📍</span>
                <span className="font-semibold truncate">{match.zone ?? 'Sin zona'}</span>
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
