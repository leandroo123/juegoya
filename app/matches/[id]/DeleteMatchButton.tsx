'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteMatchButtonProps {
  matchId: string
  isOrganizer: boolean
}

export default function DeleteMatchButton({ matchId, isOrganizer }: DeleteMatchButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  if (!isOrganizer) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el partido')
      }

      router.push('/matches')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('No se pudo eliminar el partido. Intentá de nuevo.')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Eliminar partido
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Eliminar partido?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminará el partido y se notificará a todos los jugadores inscriptos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
