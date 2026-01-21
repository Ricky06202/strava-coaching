import React, { useState, useEffect } from 'react'
import PerformanceGraph from './PerformanceGraph'
import { X, Calendar, Download, RefreshCw } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  athleteName: string
  athleteId: number | null
}

export default function HistoryModal({
  isOpen,
  onClose,
  athleteName,
  athleteId,
}: Props) {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [days, setDays] = useState(180)

  useEffect(() => {
    if (isOpen && athleteId) {
      fetchHistory()
    }
  }, [isOpen, athleteId, days])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/athlete/${athleteId}/history?days=${days}`,
      )
      if (response.ok) {
        const historyData = await response.json()
        setData(historyData)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-orange-500 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">{athleteName}</h2>
            <p className="text-orange-100 flex items-center gap-1 opacity-90 mt-1">
              <Calendar className="w-4 h-4" /> Historial de Rendimiento (PMC)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex gap-2">
            {[180, 365, 730].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  days === d
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200'
                }`}
              >
                {d === 730 ? '2 Años' : d === 365 ? '1 Año' : '6 Meses'}
              </button>
            ))}
          </div>
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-orange-600 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[450px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="w-12 h-12 animate-spin mb-4 text-orange-200" />
              <p className="animate-pulse">Calculando métricas históricas...</p>
            </div>
          ) : data.length > 0 ? (
            <PerformanceGraph data={data} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              No hay datos disponibles para este periodo.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-xs text-gray-400 flex justify-between items-center">
          <p>Potenciado por Strava Coaching PMC Engine</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Fitness
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-pink-500" /> Fatigue
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" /> Form
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
