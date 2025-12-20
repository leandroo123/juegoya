'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { loginSchema } from '@/lib/validations'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Validate email
      const result = loginSchema.safeParse({ email })
      if (!result.success) {
        setMessage({ type: 'error', text: result.error.issues[0].message })
        setLoading(false)
        return
      }

      // Build callback URL with redirect parameter if present
      let callbackUrl = `${window.location.origin}/api/auth/callback`
      if (redirect) {
        callbackUrl += `?redirect=${encodeURIComponent(redirect)}`
      }

      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: result.data.email,
        options: {
          emailRedirectTo: callbackUrl,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: '¡Link enviado! Revisá tu email para continuar.',
        })
        setEmail('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Error inesperado. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">JuegoYa</h1>
          <p className="text-gray-600">Armá partidos y completá cupos</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar link mágico'}
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

        <p className="mt-6 text-center text-sm text-gray-500">
          Recibirás un link por email para ingresar sin contraseña
        </p>
      </div>
    </div>
  )
}
