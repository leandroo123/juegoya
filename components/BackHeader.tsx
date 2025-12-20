'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface BackHeaderProps {
  title?: string
  destination?: string
}

export default function BackHeader({ title, destination }: BackHeaderProps) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams()

  const handleBack = () => {
    if (destination) {
      router.push(destination)
    } else {
      router.back()
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b sticky top-0 z-10 w-full shadow-sm">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
        aria-label="Volver"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </button>
      {title && <h1 className="text-xl font-bold text-gray-900">{title}</h1>}
    </div>
  )
}
