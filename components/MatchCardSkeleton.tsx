export default function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Date and Time */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Location and Price */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-40"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      {/* Organizer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  )
}
