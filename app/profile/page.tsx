import { Suspense } from 'react'
import ProfileClient from './ProfileClient'

function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Cargando perfil...</p>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileClient />
    </Suspense>
  )
}
