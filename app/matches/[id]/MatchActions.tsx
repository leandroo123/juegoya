'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

interface MatchActionsProps {
  matchId: string
  isFull: boolean
  userParticipation: { role: 'signed_up' | 'substitute' } | null
  matchStatus: 'open' | 'canceled' | 'finished' | string
}

export default function MatchActions({ matchId, isFull, userParticipation, matchStatus }: MatchActionsProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isMatchOpen = matchStatus === 'open'

  const handleJoin = async (preferSubstitute: boolean) => {
    if (loading) return
    setLoading(true)
    setMessage(null)

    try {
      // En Supabase RPC, si tu función fue creada como join_match(p_match_id uuid, p_prefer_substitute boolean),
      // los nombres de args deben matchear exactamente.
      const { data, error } = await supabase.rpc('join_match', {
        p_match_id: matchId,
        p_prefer_substitute: preferSubstitute,
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        const msg =
          error.message.includes('Not authenticated')
            ? 'Necesitás iniciar sesión para unirte.'
            : error.message.includes('not found') || error.message.includes('not open')
              ? 'Este partido ya no está disponible.'
              : 'No pudimos anotarte. Intentá de nuevo.'
        setMessage({ type: 'error', text: msg })
        setLoading(false)
        return
      }

      const role = data as string
      const roleText = role === 'signed_up' ? 'titular' : 'suplente'
      setMessage({ type: 'success', text: `¡Te anotaste como ${roleText}!` })

      router.refresh()
      setLoading(false)
    } catch (err) {
      console.error('Error joining match:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Verificá tu internet e intentá de nuevo.' })
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (loading) return
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.rpc('leave_match', {
        p_match_id: matchId,
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        const msg =
          error.message.includes('Not authenticated')
            ? 'Necesitás iniciar sesión.'
            : error.message.includes('Not joined') || error.message.includes('already canceled')
              ? 'No estás anotado en este partido.'
              : 'No pudimos darte de baja. Intentá de nuevo.'
        setMessage({ type: 'error', text: msg })
        setLoading(false)
        return
      }

      setMessage({ type: 'success', text: 'Te bajaste del partido.' })
      router.refresh()
      setLoading(false)
    } catch (err) {
      console.error('Error leaving match:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Verificá tu internet e intentá de nuevo.' })
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones</h2>

      {!isMatchOpen ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-700 text-center">Este partido ya no acepta inscripciones.</p>
        </div>
      ) : userParticipation ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              ✓ Estás anotado como {userParticipation.role === 'signed_up' ? 'titular' : 'suplente'}
            </p>
          </div>

          <button
            onClick={handleLeave}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Me bajo'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {!isFull && (
            <button
              onClick={() => handleJoin(false)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : '¡Juego!'}
            </button>
          )}

          <button
            onClick={() => handleJoin(true)}
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Soy suplente'}
          </button>
        </div>
      )}

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
