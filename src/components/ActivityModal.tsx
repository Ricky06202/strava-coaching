import React from 'react'

interface Activity {
  name: string
  type: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  start_date: string
}

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity | null
  isLoading: boolean
  athleteName: string
}

export default function ActivityModal({
  isOpen,
  onClose,
  activity,
  isLoading,
  athleteName,
}: ActivityModalProps) {
  if (!isOpen) return null

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + ' km'
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-orange-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">{athleteName}</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
            </div>
          ) : activity ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                  {activity.type === 'Run'
                    ? '🏃'
                    : activity.type === 'Ride'
                      ? '🚴'
                      : '🏅'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xl">
                    {activity.name}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {formatDate(activity.start_date)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    Distancia
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDistance(activity.distance)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    Tiempo
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(activity.moving_time)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center col-span-2">
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                    Desnivel
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activity.total_elevation_gain} m
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No se encontró actividad reciente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
