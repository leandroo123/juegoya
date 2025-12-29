'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'
// import type { Database, Profile } from '@/lib/types' // Temporarily commented due to types generation issue

interface MatchActionsProps {
  matchId: string
  isFull: boolean
  userParticipation: { role: 'signed_up' | 'substitute' } | null
  matchStatus: 'open' | 'canceled' | 'finished' | string
  matchSport: string
  matchPadelLevel?: string
}

export default function MatchActions({ matchId, isFull, userParticipation, matchStatus, matchSport, matchPadelLevel }: MatchActionsProps) {
  const router = useRouter()
  // Explicitly type the client to ensure generic propagation
  const supabase: SupabaseClient<Database> = createClient()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isMatchOpen = matchStatus === 'open'

  // Helper to convert level string (e.g., '6ta') to number (6)
  const getLevelValue = (levelStr?: string) => {
    if (!levelStr) return 0
    return parseInt(levelStr) || 0
  }

  const handleJoin = async (preferSubstitute: boolean) => {
    if (loading) return
    setLoading(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
         setMessage({ type: 'error', text: 'Debes iniciar sesión.' })
         setLoading(false)
         return
      }

      // Padel Logic Check
      if (matchSport === 'Pádel' && matchPadelLevel) {
        // Fetch user profile to get their level
        const { data: profile } = await supabase
          .from('profiles')
          .select('padel_category')
          .eq('id', user.id)
          .single()
        
        // Use proper type assertion or optional chaining
        const userLevelStr = (profile as unknown as Profile)?.padel_category
        
        if (!userLevelStr) {
           setMessage({ type: 'error', text: 'Tu perfil no tiene categoría de pádel. Actualizalo para unirte.' })
           setLoading(false)
           return
        }

        const matchVal = getLevelValue(matchPadelLevel)
        const userVal = getLevelValue(userLevelStr)

        // Logic +/- 1 level
        const diff = Math.abs(matchVal - userVal)
        
        if (diff > 1) {
           setMessage({ type: 'error', text: `Tu categoría (${userLevelStr}) no es compatible con el partido (${matchPadelLevel}). Solo se admite ±1 categoría.` })
           setLoading(false)
           return
        }
      }

      // Proceed to Join
      // Use explicit type for RPC args definition to ensure data integrity
      const rpcArgs: Database['public']['Functions']['join_match']['Args'] = {
        p_match_id: matchId,
        p_prefer_substitute: preferSubstitute,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.rpc('join_match', rpcArgs as any)

      if (error) {
        throw error
      }

      const role = data as string
      const roleText = role === 'signed_up' ? 'titular' : 'suplente'
      setMessage({ type: 'success', text: `¡Te anotaste como ${roleText}!` })

      // MOCK WhatsApp Notification
      console.log('✅ [WhatsApp Mock] Enviando mensaje a usuario...')
      console.log(`Msg: Te anotaste a un partido de ${matchSport}.`)

      router.refresh()
      setLoading(false)
    } catch (err: unknown) {
      console.error('Error joining match:', err)
      const errorObj = err as Error
      const msg = errorObj.message || 'Error desconocido'
       if (msg.includes('Not authenticated')) setMessage({ type: 'error', text: 'Necesitás iniciar sesión.' })
       else if (msg.includes('not found')) setMessage({ type: 'error', text: 'El partido no está disponible.' })
       else setMessage({ type: 'error', text: 'No pudimos anotarte. Intentá de nuevo.' })
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (loading) return
    setLoading(true)
    setMessage(null)

    try {
      const rpcArgs: Database['public']['Functions']['leave_match']['Args'] = {
        p_match_id: matchId,
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.rpc('leave_match', rpcArgs as any)

      if (error) {
         throw error
      }

      setMessage({ type: 'success', text: 'Te bajaste del partido.' })
      router.refresh()
      setLoading(false)
    } catch (err: unknown) {
      console.error('Error leaving match:', err)
      setMessage({ type: 'error', text: 'No pudimos darte de baja. Intentá de nuevo.' })
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
