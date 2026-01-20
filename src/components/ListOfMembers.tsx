import React from 'react'
import MemberCard from './MemberCard'

interface Props {
  athletes: any[]
}

export default function ListOfMembers({ athletes }: Props) {
  if (athletes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500 italic">
          No hay alumnos conectados todavía.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {athletes.map((athlete) => (
        <MemberCard key={athlete.id} athlete={athlete} />
      ))}
    </div>
  )
}
