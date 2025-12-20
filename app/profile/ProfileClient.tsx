'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { profileSchema } from '@/lib/validations'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Database } from '@/lib/types'

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

const SPORTS = ['Fútbol 5', 'Pádel', 'Tenis']
const PADEL_CATEGORIES = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va']

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
    level: undefined as number | undefined, // Futbol 5
    sports: [] as string[],
    padel_category: '',
    tennis_level: undefined as number | undefined,
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
      
      const profile = data

      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          whatsapp: profile.whatsapp || '',
          zone: profile.zone || '',
          level: profile.level || undefined,
          sports: profile.sports || [],
          padel_category: profile.padel_category || '',
          tennis_level: profile.tennis_level || undefined,
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
      // Logic: If sport is NOT selected, ensure its level is null
      const finalData = {
        ...formData,
        level: formData.sports.includes('Fútbol 5') ? formData.level : null,
        padel_category: formData.sports.includes('Pádel') ? formData.padel_category : null,
        tennis_level: formData.sports.includes('Tenis') ? formData.tennis_level : null,
      } as any

      // Validate with Zod
      const result = profileSchema.safeParse(finalData)
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
      // Using 'as any' safely here because lib/types is updated but TS might complain about partial matches or exact types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {
        id: user.id,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        whatsapp: result.data.whatsapp,
        zone: result.data.zone || null,
        level: result.data.level || null,
        sports: result.data.sports || null,
        padel_category: result.data.padel_category || null,
        tennis_level: result.data.tennis_level || null,
        updated_at: new Date().toISOString(),
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('profiles').upsert(updates as any)

      if (error) {
        setMessage({ type: 'error', text: error.message })
        setSaving(false)
        return
      }

      setMessage({ type: 'success', text: '¡Perfil guardado!' })
      setTimeout(() => {
        router.push(redirectTo)
      }, 800)
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
                Solo números (9-15 dígitos)
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

            {/* Deportes y Niveles */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Deportes y Niveles
              </label>
              
              <div className="space-y-6">
                
                {/* Fútbol 5 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.sports.includes('Fútbol 5')}
                      onChange={(e) => {
                        const newSports = e.target.checked
                          ? [...formData.sports, 'Fútbol 5']
                          : formData.sports.filter(s => s !== 'Fútbol 5')
                        setFormData({ ...formData, sports: newSports })
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-800">Fútbol 5</span>
                  </label>
                  
                  {formData.sports.includes('Fútbol 5') && (
                    <div className="ml-8 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm text-gray-700 mb-1">Nivel de Fútbol 5 *</label>
                      <select
                        value={formData.level || ''}
                        onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Seleccioná nivel</option>
                        {[1, 2, 3, 4, 5].map(l => (
                          <option key={l} value={l}>{l} - {['Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Experto'][l-1]}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Pádel */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.sports.includes('Pádel')}
                      onChange={(e) => {
                        const newSports = e.target.checked
                          ? [...formData.sports, 'Pádel']
                          : formData.sports.filter(s => s !== 'Pádel')
                        setFormData({ ...formData, sports: newSports })
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-800">Pádel</span>
                  </label>
                  
                  {formData.sports.includes('Pádel') && (
                    <div className="ml-8 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm text-gray-700 mb-1">Categoría de Pádel *</label>
                      <select
                        value={formData.padel_category || ''}
                        onChange={(e) => setFormData({ ...formData, padel_category: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Seleccioná categoría</option>
                        {PADEL_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Tenis */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.sports.includes('Tenis')}
                      onChange={(e) => {
                        const newSports = e.target.checked
                          ? [...formData.sports, 'Tenis']
                          : formData.sports.filter(s => s !== 'Tenis')
                        setFormData({ ...formData, sports: newSports })
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="font-semibold text-gray-800">Tenis</span>
                  </label>
                  
                  {formData.sports.includes('Tenis') && (
                    <div className="ml-8 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-sm text-gray-700 mb-1">Nivel de Tenis *</label>
                      <select
                        value={formData.tennis_level || ''}
                        onChange={(e) => setFormData({ ...formData, tennis_level: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Seleccioná nivel</option>
                        {[1, 2, 3, 4, 5].map(l => (
                          <option key={l} value={l}>{l} - {['Principiante', 'Básico', 'Intermedio', 'Avanzado', 'Experto'][l-1]}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

              </div>
            </div>

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
