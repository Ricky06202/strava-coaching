import React, { useState } from 'react'
import MemberCard from './MemberCard'
import PerformanceModal from './PerformanceModal'

interface Props {
  athletes: any[]
}

export default function ListOfMembers({ athletes }: Props) {
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAthleteName, setSelectedAthleteName] = useState('')
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(
    null,
  )

  const fetchMetrics = async (athleteId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/athlete/${athleteId}/performance`)
      if (response.ok) {
        const data = await response.json()
        setPerformanceMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAthleteClick = async (athlete: any) => {
    setSelectedAthleteName(`${athlete.firstname} ${athlete.lastname}`)
    setSelectedAthleteId(athlete.id)
    setIsModalOpen(true)
    setPerformanceMetrics(null)
    await fetchMetrics(athlete.id)
  }

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {athletes.map((athlete) => (
          <MemberCard
            key={athlete.id}
            athlete={athlete}
            onClick={() => handleAthleteClick(athlete)}
          />
        ))}
      </div>

      <PerformanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metrics={performanceMetrics}
        isLoading={isLoading}
        athleteName={selectedAthleteName}
        athleteId={selectedAthleteId}
        onRefresh={() => selectedAthleteId && fetchMetrics(selectedAthleteId)}
      />
    </>
  )
}
