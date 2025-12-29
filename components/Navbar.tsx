'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Hamburger (mobile) + Brand + Navigation (desktop) */}
        <div className="flex items-center gap-6">
          {/* Hamburger Menu (Mobile only) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Menu"
          >
            <span className="w-6 h-0.5 bg-gray-700 rounded-full transition-all" />
            <span className="w-6 h-0.5 bg-gray-700 rounded-full transition-all" />
            <span className="w-6 h-0.5 bg-gray-700 rounded-full transition-all" />
          </button>

          {/* Brand */}
          <Link
            href="/home"
            className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <Image src="/logo.png" alt="JuegoYa" width={28} height={28} className="w-7 h-7" />
            <span>JuegoYa</span>
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/matches" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
              Partidos
            </Link>
            <Link href="/my-matches" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
              Mis Partidos
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
              Perfil
            </Link>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Ingresar
          </Link>
          <Link
            href="/matches/new"
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition shadow-sm hover:shadow-md"
          >
            Crear Partido
          </Link>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-3 py-2 flex flex-col gap-1">
            <Link
              href="/profile"
              className="text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Perfil
            </Link>
            <Link
              href="/matches"
              className="text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Partidos
            </Link>
            <Link
              href="/my-matches"
              className="text-gray-700 hover:bg-gray-100 px-4 py-3 rounded-lg transition font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Mis Partidos
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
