'use client'

import { useEffect } from 'react'

interface ConfettiEffectProps {
  isFull: boolean
  totalSlots: number
}

export default function ConfettiEffect({ isFull, totalSlots }: ConfettiEffectProps) {
  useEffect(() => {
    if (isFull && totalSlots > 0) {
      // Dynamically import canvas-confetti only when needed
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']
        })
      })
    }
  }, [isFull, totalSlots])

  return null // This component doesn't render anything
}
