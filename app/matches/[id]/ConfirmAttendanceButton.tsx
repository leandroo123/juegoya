'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConfirmAttendanceButtonProps {
  matchId: string
  matchStartsAt: string
  isConfirmed: boolean
  userParticipation: any
}

export default function ConfirmAttendanceButton({ 
  matchId, 
  matchStartsAt, 
  isConfirmed,
  userParticipation 
}: ConfirmAttendanceButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  // Calcular si faltan menos de 2 horas
  const hoursUntilMatch = (new Date(matchStartsAt).getTime() - Date.now()) / (1000 * 60 * 60)
  const canConfirm = hoursUntilMatch <= 2 && hoursUntilMatch > 0

  // Solo mostrar si está inscrito y faltan menos de 2 horas
  if (!userParticipation || userParticipation.role !== 'signed_up' || !canConfirm) {
    return null
  }

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const response = await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Error al confirmar asistencia')
      }

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('No se pudo confirmar. Intentá de nuevo.')
    } finally {
      setConfirming(false)
    }
  }

  if (isConfirmed) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 text-center">
        <p className="text-green-800 font-bold text-lg">
          ✅ Asistencia confirmada
        </p>
        <p className="text-green-600 text-sm mt-1">
          ¡Nos vemos en la cancha!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4">
      <p className="text-yellow-900 font-bold text-lg mb-3">
        ⏰ El partido empieza pronto
      </p>
      <p className="text-yellow-700 text-sm mb-4">
        Confirmá tu asistencia para que el organizador sepa que vas
      </p>
      <button
        onClick={handleConfirm}
        disabled={confirming}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
      >
        {confirming ? 'Confirmando...' : '✓ Confirmar Asistencia'}
      </button>
    </div>
  )
}
