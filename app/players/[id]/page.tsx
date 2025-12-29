import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
// Local type definition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = any

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/players/${id}`)
  }

  // 2. Fetch Player Profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const profile = data as Profile | null

  if (error || !profile) {
    if (error?.code === 'PGRST116') {
      notFound() // No existe
    }
    // Otro error (e.g. permiso denegado por RLS)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <p className="text-red-600 mb-4">No se pudo cargar el perfil.</p>
          <Link href="/home" className="text-blue-600 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Jugador'
  const sports = profile.sports || []

  // Helper to format WhatsApp number for wa.me links
  // Removes ALL non-numeric characters (including +, spaces, hyphens, parentheses)
  // WhatsApp API requires clean international format: e.g., 5989XXXXXXXX for Uruguay
  const formatWhatsAppNumber = (whatsapp: string) => {
    // Remove all non-numeric characters
    const cleaned = whatsapp.replace(/\D/g, '')
    return cleaned
  }

  // Helper to get level display
  const getLevelDisplay = (sport: string) => {
    if (sport === 'Fútbol 5') return profile.level ? `Nivel ${profile.level}` : 'Sin nivel'
    if (sport === 'Tenis') return profile.tennis_level ? `Nivel ${profile.tennis_level}` : 'Sin nivel'
    if (sport === 'Pádel') return profile.padel_category ? `Categoría ${profile.padel_category}` : 'Sin categoría'
    return ''
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          {/* Header Colored */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">{fullName}</h1>
            {profile.zone && (
              <p className="text-blue-100 mt-1 flex items-center gap-2">
                📍 {profile.zone}
              </p>
            )}
          </div>

          <div className="p-8 space-y-8">
            {/* WhatsApp CTA */}
            {profile.whatsapp && (
              <div>
                <a
                  href={`https://wa.me/${formatWhatsAppNumber(profile.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  <span>💬</span>
                  Contactar por WhatsApp
                </a>
                <p className="mt-2 text-sm text-gray-500">
                  Visible solo para usuarios registrados
                </p>
              </div>
            )}

            {/* Deportes */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deportes</h2>
              {sports.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {sports.map((sport: string) => (
                    <div key={sport} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="font-semibold text-gray-900 mb-1">{sport}</div>
                      <div className="text-blue-600 font-medium">
                        {getLevelDisplay(sport)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No tiene deportes seleccionados</p>
              )}
            </div>

            {/* Back link */}
            <div className="pt-6 border-t border-gray-100">
              <Link href="/home" className="text-gray-600 hover:text-gray-900 font-medium">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
