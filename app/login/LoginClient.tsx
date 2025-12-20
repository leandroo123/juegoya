'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { useSearchParams } from 'next/navigation'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      let callbackUrl = `${window.location.origin}/api/auth/callback`

      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
        callbackUrl += `?redirect=${encodeURIComponent(redirect)}`
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl },
      })

      if (error) {
        setMessage({ type: 'error', text: 'No pudimos enviar el link. Revisá el email e intentá de nuevo.' })
        return
      }

      setMessage({
        type: 'success',
        text: 'Te enviamos un link a tu email. Abrilo desde el mismo dispositivo donde querés entrar.',
      })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Error de conexión. Probá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Entrar a JuegoYa</h1>
        <p className="text-gray-600 mb-6">Te mandamos un link mágico al mail (sin contraseña).</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              placeholder="tu@mail.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar link'}
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
  )
}
