'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useSearchParams, useRouter } from 'next/navigation'

const SPORTS = ['Fútbol 5', 'Pádel', 'Tenis']
const PADEL_CATEGORIES = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va']

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/matches'
  const startType = searchParams.get('type') === 'register' ? 'register' : 'login'
  
  const supabase = createClient()
  const [authMode, setAuthMode] = useState<'login' | 'register'>(startType)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration Extra State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [padelLevel, setPadelLevel] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push(redirectPath)
      } else {
        // REGISTER FLOW
        // 1. Validate Profile Data First
        if (!firstName || !lastName || !whatsapp) {
          throw new Error('Completá nombre, apellido y WhatsApp.')
        }
        if (selectedSports.includes('Pádel') && !padelLevel) {
          throw new Error('Si jugás Pádel, indicá tu categoría.')
        }

        // 2. SignUp with email confirmation disabled
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined, // Disable email confirmation
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        })
        if (authError) throw authError
        if (!authData.user) throw new Error('No se pudo crear el usuario')

        // 3. Create/Update Profile immediately with all data
        // Note: Trigger might create a row, but we ensure fields are populated
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          whatsapp,
          sports: selectedSports,
          padel_category: selectedSports.includes('Pádel') ? padelLevel : null,
          updated_at: new Date().toISOString()
        } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

        if (profileError) {
          console.error('Profile update error:', profileError)
          // Continue anyway, auth worked
        }

        // Auto-login after signup (no email confirmation needed)
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          console.error('Auto-login error:', loginError)
          // Show success but ask to login manually
          setMessage({ 
            type: 'success', 
            text: '✅ Cuenta creada. Iniciá sesión para continuar.' 
          })
          setAuthMode('login')
          setSaving(false)
          return
        }

        // Success - redirect immediately
        router.push(redirectPath)
      }
    } catch (err: unknown) {
      console.error(err)
      let msg = err instanceof Error ? err.message : 'Error desconocido'
      if (msg.includes('Invalid login')) msg = 'Email o contraseña incorrectos.'
      if (msg.includes('User already registered')) msg = 'Este email ya está registrado.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setLoading(false)
    }
  }

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport))
    } else {
      setSelectedSports([...selectedSports, sport])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {authMode === 'login' ? '¡Hola de nuevo!' : 'Crear cuenta'}
        </h1>
        <p className="text-gray-600 mb-6">
          {authMode === 'login' 
            ? 'Ingresá para anotarte a los partidos.' 
            : 'Unite a la comunidad de JuegoYa.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Email / Password (Common) */}
          <div>
            <label className="label-standard">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-standard"
              placeholder="nombre@ejemplo.com"
            />
          </div>
          <div>
            <label className="label-standard">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input-standard"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Registration Fields */}
          {authMode === 'register' && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-standard">Nombre</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input-standard"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="label-standard">Apellido</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input-standard"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="label-standard">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="099123456"
                  required
                  className="input-standard"
                />
              </div>

              <div>
                <label className="label-standard mb-2">Tus Deportes</label>
                <div className="flex gap-2 flex-wrap">
                  {SPORTS.map(sport => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                        selectedSports.includes(sport)
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSports.includes('Pádel') && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="label-standard">Nivel de Pádel</label>
                  <select
                    value={padelLevel}
                    onChange={(e) => setPadelLevel(e.target.value)}
                    required
                    className="input-standard"
                  >
                    <option value="">Seleccioná categoría</option>
                    {PADEL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6"
          >
            {loading ? 'Procesando...' : (authMode === 'login' ? 'Ingresar' : 'Crear Cuenta')}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mt-6 text-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login')
              setMessage(null)
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
          >
            {authMode === 'login' 
              ? '¿No tenés cuenta? Creá una acá' 
              : '¿Ya tenés cuenta? Ingresá acá'}
          </button>
        </div>
      </div>
    </div>
  )
}
