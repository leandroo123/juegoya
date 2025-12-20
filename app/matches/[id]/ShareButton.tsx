'use client'

import { useState } from 'react'

interface ShareButtonProps {
  matchId: string
  sport: string
}

export default function ShareButton({ matchId, sport }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/matches/${matchId}`
    const shareText = `¡Unite a jugar ${sport}! ${shareUrl}`

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Partido de ${sport}`,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (err) {
        // User cancelled or error, fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silent fail
    }
  }

  const handleWhatsApp = () => {
    const shareUrl = `${window.location.origin}/matches/${matchId}`
    const shareText = `¡Unite a jugar ${sport}! ${shareUrl}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleWhatsApp}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
      >
        <span>📱</span>
        Compartir por WhatsApp
      </button>
      <button
        onClick={handleShare}
        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        {copied ? '✓ Link copiado' : 'Compartir link'}
      </button>
    </div>
  )
}
