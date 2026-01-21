import React from 'react'
import { TrendingUp } from 'lucide-react'

interface Props {
  athlete: {
    id: number
    firstname: string | null
    lastname: string | null
  }
  onClick?: () => void
  onGraphClick?: (e: React.MouseEvent) => void
}

export default function MemberCard({ athlete, onClick, onGraphClick }: Props) {
  const fullName =
    `${athlete.firstname ?? ''} ${athlete.lastname ?? ''}`.trim() ||
    'Alumno Strava'

  return (
    <div
      onClick={onClick}
      className="group flex gap-4 items-center w-full h-24 bg-white shadow-sm overflow-hidden rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer relative"
    >
      <div className="w-24 h-24 bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl group-hover:scale-110 transition-transform">
        {athlete.firstname?.[0] || 'S'}
      </div>
      <div className="flex flex-col flex-1 pl-4">
        <h2 className="font-bold text-gray-900 leading-tight text-lg">
          {fullName}
        </h2>
        <p className="text-sm text-gray-500 mt-1">ID: {athlete.id}</p>
      </div>

      {/* Graph Shortcut */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onGraphClick?.(e)
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-orange-50 text-orange-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 hover:text-white"
        title="Ver historial"
      >
        <TrendingUp className="w-6 h-6" />
      </button>
    </div>
  )
}
