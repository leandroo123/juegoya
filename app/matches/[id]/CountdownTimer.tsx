'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  startsAt: string
}

export default function CountdownTimer({ startsAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const matchTime = new Date(startsAt).getTime()
      const difference = matchTime - now

      if (difference <= 0) {
        setTimeLeft('¡Ya empezó!')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`Faltan ${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`Faltan ${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`Faltan ${minutes} minutos`)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [startsAt])

  return (
    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm">
      <span>⏰</span>
      <span>{timeLeft}</span>
    </div>
  )
}
