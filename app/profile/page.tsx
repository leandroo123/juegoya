import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BackHeader from '@/components/BackHeader'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = any

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    redirect('/profile/edit')
  }

  const profile = profileData as Profile | null

  if (!profile) {
    redirect('/profile/edit')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <BackHeader title="Mi Perfil" destination="/home" />

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6 border-t border-gray-100 pt-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">WhatsApp</p>
              <p className="text-gray-900 text-lg">{profile.whatsapp || '-'}</p>
            </div>

            {/* ✅ ACÁ AGREGADO: GÉNERO */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Género</p>
              <p className="text-gray-900 text-lg">{profile.gender || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Zona</p>
              <p className="text-gray-900 text-lg">{profile.zone || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Deportes</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.sports?.map((sport: string) => (
                  <span
                    key={sport}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {sport}
                  </span>
                ))}
                {(!profile.sports || profile.sports.length === 0) && (
                  <span className="text-gray-400 italic">Ninguno</span>
                )}
              </div>
            </div>

            {profile.sports?.includes('Pádel') && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nivel de Pádel</p>
                <p className="text-gray-900 text-lg">{profile.padel_category || '-'}</p>
              </div>
            )}

            {profile.sports?.includes('Tenis') && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nivel de Tenis</p>
                <p className="text-gray-900 text-lg">{profile.tennis_level || '-'}</p>
              </div>
            )}

            {profile.sports?.includes('Fútbol 5') && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nivel de Fútbol 5</p>
                <p className="text-gray-900 text-lg">{profile.level || '-'}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/profile/edit"
              className="block w-full bg-white border-2 border-blue-600 text-blue-600 font-bold text-center py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Editar Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
