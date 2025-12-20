'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { profileSchema } from '@/lib/validations'
import { useRouter, useSearchParams } from 'next/navigation'

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

const SPORTS = ['Fútbol 5', 'Fútbol 7', 'Pádel', 'Básquet']

export default function ProfileClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/matches'
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    whatsapp: '',
    zone: '',
    level: undefined as number | undefined,
    sports: [] as string[],
    padel_level: undefined as number | undefined,
  })

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // ⚠️ Cast manual para evitar error "never" por fallos de inferencia
      const profile = data as unknown as import('@/lib/types').Profile | null

      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          whatsapp: profile.whatsapp || '',
          zone: profile.zone || '',
          level: profile.level || undefined,
          sports: profile.sports || [],
          padel_level: profile.padel_level || undefined,
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Validate
      const result = profileSchema.safeParse(formData)
      if (!result.success) {
        setMessage({ type: 'error', text: result.error.issues[0].message })
        setSaving(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'No autenticado' })
        setSaving(false)
        return
      }

      // Upsert profile
      const updates = {
        id: user.id,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        whatsapp: result.data.whatsapp,
        zone: result.data.zone || null,
        level: result.data.level || null,
        sports: result.data.sports || null,
        padel_level: result.data.sports?.includes('Pádel') ? result.data.padel_level : null,
        updated_at: new Date().toISOString(),
      }
      
      const { error } = await supabase.from('profiles').upsert(updates as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        setMessage({ type: 'error', text: error.message })
        setSaving(false)
        return
      }

      setMessage({ type: 'success', text: '¡Perfil guardado!' })
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } catch {
      setMessage({ type: 'error', text: 'Error inesperado. Intentá de nuevo.' })
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tu Perfil</h1>
          <p className="text-gray-600 mb-8">
            Completá tu información para crear y unirte a partidos
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Juan"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Pérez"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+598 99 123 456 o 099123456"
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Podés usar espacios o guiones, se normalizará automáticamente
              </p>
            </div>

            {/* Zona */}
            <div>
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-2">
                Zona (opcional)
              </label>
              <select
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              >
                <option value="">Seleccioná tu zona</option>
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Nivel (opcional)
              </label>
              <select
                id="level"
                value={formData.level || ''}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value ? Number(e.target.value) : undefined })
                }
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
              >
                <option value="">Seleccioná tu nivel</option>
                <option value="1">1 - Principiante</option>
                <option value="2">2 - Básico</option>
                <option value="3">3 - Intermedio</option>
                <option value="4">4 - Avanzado</option>
                <option value="5">5 - Experto</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Nivel aproximado, no te preocupes</p>
            </div>

            {/* Deportes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Deportes que jugás (opcional)
              </label>
              <div className="space-y-2">
                {SPORTS.map((sport) => (
                  <label key={sport} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sports.includes(sport)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, sports: [...formData.sports, sport] })
                        } else {
                          setFormData({
                            ...formData,
                            sports: formData.sports.filter((s) => s !== sport),
                            // Si deselecciona Pádel, limpiar padel_level
                            padel_level: sport === 'Pádel' ? undefined : formData.padel_level,
                          })
                        }
                      }}
                      disabled={saving}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{sport}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nivel de Pádel (condicional) */}
            {formData.sports.includes('Pádel') && (
              <div>
                <label htmlFor="padel_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Pádel <span className="text-red-500">*</span>
                </label>
                <select
                  id="padel_level"
                  value={formData.padel_level || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      padel_level: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  disabled={saving}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
                  required
                >
                  <option value="">Seleccioná tu nivel de Pádel</option>
                  <option value="1">1 - Principiante</option>
                  <option value="2">2 - Básico</option>
                  <option value="3">3 - Intermedio</option>
                  <option value="4">4 - Avanzado</option>
                  <option value="5">5 - Experto</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Nivel específico de Pádel (obligatorio si seleccionaste Pádel)
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar perfil'}
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
