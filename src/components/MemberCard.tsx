import React from 'react'

interface Props {
  athlete: {
    id: number
    firstname: string | null
    lastname: string | null
  }
}

export default function MemberCard({ athlete }: Props) {
  const fullName =
    `${athlete.firstname ?? ''} ${athlete.lastname ?? ''}`.trim() ||
    'Alumno Strava'

  return (
    <div className="flex gap-2 items-center w-64 h-20 bg-white shadow-sm overflow-hidden rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer">
      <div className="w-20 h-20 bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
        {athlete.firstname?.[0] || 'S'}
      </div>
      <div className="flex flex-col flex-1 pl-2">
        <h2 className="font-semibold text-gray-900 leading-tight">
          {fullName}
        </h2>
        <p className="text-sm text-gray-500">ID: {athlete.id}</p>
      </div>
    </div>
  )
}
