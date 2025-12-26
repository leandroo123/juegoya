import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/home" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition">
          JuegoYa
        </Link>
        
        {/* Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/matches" className="text-gray-600 hover:text-gray-900">
            Partidos
          </Link>
          <Link href="/my-matches" className="text-gray-600 hover:text-gray-900">
            Mis Partidos
          </Link>
          <Link href="/matches/new" className="text-gray-600 hover:text-gray-900">
            Crear
          </Link>
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            Perfil
          </Link>
        </div>
      </div>
    </nav>
  )
}
