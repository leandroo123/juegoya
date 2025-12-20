'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { createMatchSchema } from '@/lib/validations'
import { useRouter } from 'next/navigation'

const SPORTS = ['Fútbol 5', 'Fútbol 7', 'Pádel', 'Básquet', 'Tenis', 'Vóley']

const ZONES = [
  'Centro/Cordón',
  'Pocitos',
  'Punta Carretas',
  'Carrasco',
  'Malvín',
  'Buceo',
  'Parque Rodó',
  'Otra',
]

export default function NewMatchPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    sport: '',
    starts_at: '',
    zone: '',
    location_text: '',
    total_slots: 10,
    price_per_person: undefined as number | undefined,
  })

  // Load user's zone from profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('zone')
        .eq('id', user.id)
        .single()

      if (profile && (profile as any).zone) {
        setFormData((prev) => ({ ...prev, zone: (profile as any).zone }))
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submit
    if (saving) return
    
    setSaving(true)
    setMessage(null)

    try {
      // Validate
      const result = createMatchSchema.safeParse(formData)
      if (!result.success) {
        const firstError = result.error.issues[0]
        setMessage({ type: 'error', text: firstError.message })
        setSaving(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'Necesitás iniciar sesión para crear un partido' })
        setSaving(false)
        return
      }

      // Create match with explicit ID selection
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          organizer_id: user.id,
          sport: result.data.sport,
          starts_at: result.data.starts_at,
          zone: result.data.zone,
          location_text: result.data.location_text,
          total_slots: result.data.total_slots,
          price_per_person: result.data.price_per_person || null,
          status: 'open',
        } as any)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating match:', error)
        if (error.message.includes('foreign key')) {
          setMessage({ type: 'error', text: 'Completá tu perfil antes de crear un partido' })
        } else {
          setMessage({ type: 'error', text: 'No pudimos crear el partido. Intentá de nuevo.' })
        }
        setSaving(false)
        return
      }

      // Defensive validation: ensure ID exists before redirect
      if (!match || !match.id) {
        console.error('Match created but no ID returned:', match)
        setMessage({ type: 'error', text: 'No se pudo crear el partido. Intentá de nuevo.' })
        setSaving(false)
        return
      }

      // Redirect to match detail with validated ID
      router.push(`/matches/${match.id}`)
    } catch (err) {
      console.error('Error creating match:', err)
      setMessage({ type: 'error', text: 'Error de conexión. Verificá tu internet e intentá de nuevo.' })
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Partido</h1>
          <p className="text-gray-600 mb-8">Completá los datos y compartí el link</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deporte */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                Deporte <span className="text-red-500">*</span>
              </label>
              <select
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              >
                <option value="">Seleccioná el deporte</option>
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y hora */}
            <div>
              <label htmlFor="starts_at" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y hora <span className="text-red-500">*</span>
              </label>
              <input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
            </div>

            {/* Zona */}
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              >
                <option value="">Seleccioná la zona</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Lugar */}
            <div>
              <label htmlFor="location_text" className="block text-sm font-medium text-gray-700 mb-2">
                Lugar <span className="text-red-500">*</span>
              </label>
              <input
                id="location_text"
                type="text"
                value={formData.location_text}
                onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                placeholder="Ej: Complejo Deportivo X, Cancha 3"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
            </div>

            {/* Cupos */}
            <div>
              <label htmlFor="total_slots" className="block text-sm font-medium text-gray-700 mb-2">
                Cupos totales <span className="text-red-500">*</span>
              </label>
              <input
                id="total_slots"
                type="number"
                min="1"
                max="100"
                value={formData.total_slots}
                onChange={(e) => setFormData({ ...formData, total_slots: Number(e.target.value) })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price_per_person" className="block text-sm font-medium text-gray-700 mb-2">
                Precio por persona (opcional)
              </label>
              <input
                id="price_per_person"
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_person || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price_per_person: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="Ej: 200"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">En pesos uruguayos (UYU)</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Creando partido...' : 'Crear partido'}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
