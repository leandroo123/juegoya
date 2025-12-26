import { Suspense } from 'react'
import ProfileEditClient from './ProfileEditClient'

function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Cargando formulario...</p>
    </div>
  )
}

export default function ProfileEditPage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileEditClient />
    </Suspense>
  )
}
