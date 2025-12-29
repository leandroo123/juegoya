'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { createMatchSchema } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import BackHeader from '@/components/BackHeader'
import { Database } from '@/lib/types'

const SPORTS = ['Fútbol 5', 'Pádel', 'Tenis']
const PADEL_LEVELS = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va']

// Horarios cada 30 min: 06:00 a 23:30
const TIME_SLOTS: string[] = []
for (let h = 6; h <= 23; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:00`)
  // Último horario 23:30
  if (h !== 24) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:30`)
  }
}

export default function NewMatchPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Separate date/time state for UI
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [formData, setFormData] = useState({
    sport: '',
    zone: '',
    location_text: '',
    total_slots: 10,
    price_per_person: undefined as number | undefined,
    padel_level: undefined as string | undefined, // New field
  })

  // Date limits
  const today = new Date().toISOString().split('T')[0]
  const maxDateObj = new Date()
  maxDateObj.setDate(new Date().getDate() + 21) // 3 semanas
  const maxDate = maxDateObj.toISOString().split('T')[0]

  // Load user's zone / profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase.from('profiles').select('zone').eq('id', user.id).single()
      const profile = profileData as { zone: string | null } | null

      if (profile?.zone) {
        setFormData((prev) => ({ ...prev, zone: profile.zone || '' }))
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (saving) return

    setSaving(true)
    setMessage(null)

    try {
      if (!date || !time) {
        setMessage({ type: 'error', text: 'Seleccioná fecha y hora' })
        setSaving(false)
        return
      }
      
      // Create date in Uruguay timezone (UTC-3)
      // Input format: date="2025-12-27" time="19:30"
      const localDateTimeString = `${date}T${time}:00`
      const matchDateTime = new Date(localDateTimeString)
      
      // Validate: if same day, must be at least 2 hours in the future
      const now = new Date()
      const hoursUntilMatch = (matchDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      const isSameDay = matchDateTime.toDateString() === now.toDateString()
      if (isSameDay && hoursUntilMatch < 2) {
        setMessage({ 
          type: 'error', 
          text: 'Para partidos de hoy, el horario debe ser al menos 2 horas después de ahora' 
        })
        setSaving(false)
        return
      }
      
      // Convert to ISO string for Supabase (will be stored as UTC)
      const starts_at = matchDateTime.toISOString()

      // If sport is NOT Padel, ensure padel_level is null
      const finalPadelLevel = formData.sport === 'Pádel' ? formData.padel_level : null

      const payload = {
        ...formData,
        padel_level: finalPadelLevel, // override
        starts_at,
      }

      const result = createMatchSchema.safeParse(payload)
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

      // Explicitly typed insert to satisfy Supabase strict typings
      const newMatch: Database['public']['Tables']['matches']['Insert'] = {
        organizer_id: user.id,
        sport: result.data.sport,
        starts_at: result.data.starts_at,
        zone: '', // Zone field removed from form, use empty string instead of null
        location_text: result.data.location_text,
        total_slots: result.data.total_slots,
        price_per_person: result.data.price_per_person || null,
        padel_level: result.data.padel_level || null,
        status: 'open',
      }

      const { data, error } = await supabase
        .from('matches')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(newMatch as any)
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

      const matchData = data as { id: string } | null
      const matchId = matchData?.id

      if (!matchId) {
        setMessage({ type: 'error', text: 'Error creando partido (sin ID)' })
        setSaving(false)
        return
      }

      router.push(`/matches/${matchId}`)
    } catch (err) {
      console.error('Error:', err)
      setMessage({ type: 'error', text: 'Error de conexión' })
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* HEADER con Flecha Atrás */}
      <BackHeader title="Crear Partido" destination="/matches" />

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <p className="text-gray-600 mb-8">Completá los datos y compartí el link.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deporte */}
            <div>
              <label htmlFor="sport" className="label-standard mb-2">
                Deporte <span className="text-red-500">*</span>
              </label>
              <select
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                disabled={saving}
                className="input-standard"
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

            {/* NIVEL DE PADEL (Condicional) */}
            {formData.sport === 'Pádel' && (
              <div className="animate-fade-in">
                <label htmlFor="padel_level" className="label-standard mb-2">
                  Nivel de Pádel <span className="text-red-500">*</span>
                </label>
                <select
                  id="padel_level"
                  value={formData.padel_level || ''}
                  onChange={(e) => setFormData({ ...formData, padel_level: e.target.value })}
                  disabled={saving}
                  className="input-standard"
                  required
                >
                  <option value="">Seleccioná el nivel</option>
                  {PADEL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  Estrictamente requerido para balancear el partido.
                </p>
              </div>
            )}

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="label-standard mb-2">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  min={today}
                  max={maxDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={saving}
                  className="input-standard"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="label-standard mb-2">
                  Hora <span className="text-red-500">*</span>
                </label>
                <select
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={saving}
                  className="input-standard"
                  required
                >
                  <option value="">Hora</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            

            {/* Lugar */}
            <div>
              <label htmlFor="location_text" className="label-standard mb-2">
                Lugar <span className="text-red-500">*</span>
              </label>
              <input
                id="location_text"
                type="text"
                value={formData.location_text}
                onChange={(e) => setFormData({ ...formData, location_text: e.target.value })}
                placeholder="Ej: Complejo Deportivo X, Cancha 3"
                disabled={saving}
                className="input-standard"
                required
              />
            </div>

            {/* Cupos */}
            <div>
              <label htmlFor="total_slots" className="label-standard mb-2">
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
                className="input-standard"
                required
              />
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price_per_person" className="label-standard mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">En pesos uruguayos (UYU)</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
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
