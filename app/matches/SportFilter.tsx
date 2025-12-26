'use client'

interface SportFilterProps {
  selectedSport: string
  onSelectSport: (sport: string) => void
}

const SPORTS = [
  { id: 'all', label: 'Todos', icon: '🏆' },
  { id: 'Fútbol 5', label: 'Fútbol 5', icon: '⚽' },
  { id: 'Pádel', label: 'Pádel', icon: '🎾' },
  { id: 'Tenis', label: 'Tenis', icon: '🏸' },
]

export default function SportFilter({ selectedSport, onSelectSport }: SportFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SPORTS.map((sport) => (
        <button
          key={sport.id}
          onClick={() => onSelectSport(sport.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all
            ${
              selectedSport === sport.id
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }
          `}
        >
          <span className="text-lg">{sport.icon}</span>
          {sport.label}
        </button>
      ))}
    </div>
  )
}
