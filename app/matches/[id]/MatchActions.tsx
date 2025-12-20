'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

interface MatchActionsProps {
  matchId: string
  isFull: boolean
  userParticipation: any
  matchStatus: string
}

export default function MatchActions({ matchId, isFull, userParticipation, matchStatus }: MatchActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isMatchOpen = matchStatus === 'open'

  const handleJoin = async (preferSubstitute: boolean) => {
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.rpc('join_match', {
        p_match_id: matchId,
        p_prefer_substitute: preferSubstitute,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Not authenticated')) {
          setMessage({ type: 'error', text: 'Necesitás iniciar sesión para unirte' })
        } else if (error.message.includes('not found') || error.message.includes('not open')) {
          setMessage({ type: 'error', text: 'Este partido ya no está disponible' })
        } else {
          setMessage({ type: 'error', text: 'No pudimos anotarte. Intentá de nuevo.' })
        }
        setLoading(false)
        return
      }

      const role = data as string
      const roleText = role === 'signed_up' ? 'titular' : 'suplente'
      setMessage({ type: 'success', text: `¡Te anotaste como ${roleText}!` })

      // Refresh page to show updated roster
      setTimeout(() => {
        router.refresh()
        setLoading(false)
      }, 1500)
    } catch (err) {
      console.error('Error joining match:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Verificá tu internet e intentá de nuevo.' })
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.rpc('leave_match', {
        p_match_id: matchId,
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Not authenticated')) {
          setMessage({ type: 'error', text: 'Necesitás iniciar sesión' })
        } else if (error.message.includes('Not joined') || error.message.includes('already canceled')) {
          setMessage({ type: 'error', text: 'No estás anotado en este partido' })
        } else {
          setMessage({ type: 'error', text: 'No pudimos darte de baja. Intentá de nuevo.' })
        }
        setLoading(false)
        return
      }

      setMessage({ type: 'success', text: 'Te bajaste del partido' })

      // Refresh page to show updated roster
      setTimeout(() => {
        router.refresh()
        setLoading(false)
      }, 1500)
    } catch (err) {
      console.error('Error leaving match:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Verificá tu internet e intentá de nuevo.' })
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones</h2>

      {!isMatchOpen ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-700 text-center">
            Este partido ya no acepta inscripciones
          </p>
        </div>
      ) : userParticipation ? (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              ✓ Estás anotado como{' '}
              {userParticipation.role === 'signed_up' ? 'titular' : 'suplente'}
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
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
