import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Get user profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const userName = profile ? `${(profile as any).first_name} ${(profile as any).last_name}` : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">JuegoYa</h1>
          {userName && (
            <p className="text-xl text-gray-700">¡Hola, {userName}!</p>
          )}
          <p className="text-gray-600 mt-2">¿Qué querés hacer hoy?</p>
        </div>

        {/* Main CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Ver partidos */}
          <Link
            href="/matches"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                ⚽
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ver partidos
              </h2>
              <p className="text-gray-600">
                Unite a partidos que ya están armados
              </p>
            </div>
          </Link>

          {/* Crear partido */}
          <Link
            href="/matches/new"
            className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                ➕
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Crear partido
              </h2>
              <p className="text-gray-600">
                Armá un partido y completá los cupos
              </p>
            </div>
          </Link>
        </div>

        {/* Secondary actions */}
        <div className="text-center">
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar mi perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
