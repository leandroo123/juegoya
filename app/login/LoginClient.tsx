'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useSearchParams, useRouter } from 'next/navigation'

const SPORTS = ['Fútbol 5', 'Pádel', 'Tenis']
const PADEL_CATEGORIES = ['1ra', '2da', '3ra', '4ta', '5ta', '6ta', '7ma', '8va']

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startType = searchParams.get('type') === 'register' ? 'register' : 'login'
  
  const supabase = createClient()
  const [authMode, setAuthMode] = useState<'login' | 'register'>(startType)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Registration Extra State
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [gender, setGender] = useState('')
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
        
        // Force router to refresh server data before navigating
        router.refresh()
        router.push('/matches')
      } else {
        // REGISTER FLOW
        // 1. Validate Profile Data First
        if (!firstName || !lastName || !whatsapp || !gender) {
          throw new Error('Completá nombre, apellido, WhatsApp y género.')
        }
        if (selectedSports.includes('Pádel') && !padelLevel) {
          throw new Error('Si jugás Pádel, indicá tu categoría.')
        }
        // 2. Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.')
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.')
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
          gender,
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
            text: '✅ Cuenta creada exitosamente. Iniciá sesión para continuar.' 
          })
          setAuthMode('login')
          setLoading(false)
          return
        }

        // Success - show message and redirect to matches
        setMessage({ 
          type: 'success', 
          text: '✅ ¡Cuenta creada exitosamente! Redirigiendo...' 
        })
        
        // Wait a moment to show the message, then redirect
        setTimeout(() => {
          router.push('/matches')
        }, 1500)
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-standard pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password - Only for Registration */}
          {authMode === 'register' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="label-standard">Repetir Contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-standard pr-10"
                  placeholder="Repetí tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

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
                <label className="label-standard">Género *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="input-standard"
                >
                  <option value="">Seleccioná tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
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
