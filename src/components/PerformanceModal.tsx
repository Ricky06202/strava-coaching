import React, { useState, useEffect } from 'react'

interface PerformanceMetrics {
  ctl: number // Fitness
  atl: number // Fatigue
  tsb: number // Form
  lastActivityDate: string
  activityCount: number
  metricPreference?: string
  ftpHistory?: { ftp: number; date: string }[]
}

interface PerformanceModalProps {
  isOpen: boolean
  onClose: () => void
  metrics: PerformanceMetrics | null
  isLoading: boolean
  athleteName: string
  athleteId: number | null
  onRefresh: () => void
}

export default function PerformanceModal({
  isOpen,
  onClose,
  metrics,
  isLoading,
  athleteName,
  athleteId,
  onRefresh,
}: PerformanceModalProps) {
  const [metricPreference, setMetricPreference] = useState<
    'heart_rate' | 'power'
  >('heart_rate')
  const [isSaving, setIsSaving] = useState(false)

  // FTP Input State
  const [newFtp, setNewFtp] = useState<string>('')
  const [newFtpDate, setNewFtpDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )

  useEffect(() => {
    if (metrics) {
      setMetricPreference(
        (metrics.metricPreference as 'heart_rate' | 'power') || 'heart_rate',
      )
    }
  }, [metrics])

  const handleSavePreferences = async () => {
    if (!athleteId) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/athlete/${athleteId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metricPreference }),
      })
      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFtp = async () => {
    if (!athleteId || !newFtp || !newFtpDate) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/athlete/${athleteId}/ftp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftp: parseInt(newFtp), date: newFtpDate }),
      })
      if (response.ok) {
        setNewFtp('')
        onRefresh()
      }
    } catch (error) {
      console.error('Error adding FTP:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFtp = async (date: string) => {
    if (!athleteId) return
    setIsSaving(true)
    try {
      const response = await fetch(`/api/athlete/${athleteId}/ftp`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting FTP:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  // Helper to format YYYY-MM-DD strings without timezone shift
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    // If it's just YYYY-MM-DD, parse manually to avoid UTC shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day).toLocaleDateString()
    }
    // Fallback for full ISO strings
    return new Date(dateStr).toLocaleDateString()
  }

  // Helper to determine TSB color
  const getTsbColor = (tsb: number) => {
    if (tsb > 20) return 'text-orange-500' // Too rested?
    if (tsb > -10) return 'text-green-500' // Optimal
    if (tsb > -30) return 'text-yellow-500' // Grey zone
    return 'text-red-500' // High risk
  }

  const getTsbStatus = (tsb: number) => {
    if (tsb > 25) return 'Recuperación / Desentrenamiento'
    if (tsb > 5) return 'Fresco '
    if (tsb > -10) return 'Zona Óptima'
    if (tsb > -30) return 'Fatiga Productiva'
    return 'Riesgo de Sobrenetrenamiento'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">{athleteName}</h3>
            <p className="text-gray-400 text-xs uppercase tracking-wider">
              Performance Dashboard
            </p>
          </div>
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
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="text-gray-500 text-sm">
                Calculando métricas (últimos 60 días)...
              </p>
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* Top Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Fitness (CTL)
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {metrics.ctl}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                  <p className="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Fatiga (ATL)
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {metrics.atl}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                    Forma (TSB)
                  </p>
                  <p
                    className={`text-3xl font-black ${getTsbColor(metrics.tsb)}`}
                  >
                    {metrics.tsb}
                  </p>
                </div>
              </div>

              {/* Status Bar */}
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">
                  Estado Actual
                </p>
                <p className={`text-lg font-bold ${getTsbStatus(metrics.tsb)}`}>
                  {getTsbStatus(metrics.tsb)}
                </p>
              </div>

              {/* Preferences Section */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100 space-y-4">
                <p className="text-orange-800 text-xs uppercase font-bold">
                  Configuración de Métricas
                </p>

                <div className="space-y-3">
                  <label className="block text-xs text-orange-700 font-medium">
                    Calcular carga usando:
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMetricPreference('heart_rate')
                        // Update immediately
                        fetch(`/api/athlete/${athleteId}/preferences`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metricPreference: 'heart_rate',
                          }),
                        }).then(() => onRefresh())
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-bold rounded border transition-colors ${metricPreference === 'heart_rate' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                    >
                      Frecuencia Cardíaca
                    </button>
                    <button
                      onClick={() => {
                        setMetricPreference('power')
                        // Update immediately
                        fetch(`/api/athlete/${athleteId}/preferences`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ metricPreference: 'power' }),
                        }).then(() => onRefresh())
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-bold rounded border transition-colors ${metricPreference === 'power' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}
                    >
                      Potencia (Watts)
                    </button>
                  </div>
                </div>

                {metricPreference === 'power' && (
                  <div className="space-y-4 pt-4 border-t border-orange-200">
                    <p className="text-orange-800 text-xs uppercase font-bold">
                      Historial de FTP
                    </p>

                    {/* Add FTP Form */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] text-orange-700 font-bold uppercase mb-1">
                          Nuevo FTP
                        </label>
                        <input
                          type="number"
                          value={newFtp}
                          onChange={(e) => setNewFtp(e.target.value)}
                          placeholder="Watts"
                          className="w-full text-sm rounded border-orange-200 focus:ring-orange-500 focus:border-orange-500 py-1"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-orange-700 font-bold uppercase mb-1">
                          Desde Fecha
                        </label>
                        <input
                          type="date"
                          value={newFtpDate}
                          onChange={(e) => setNewFtpDate(e.target.value)}
                          className="w-full text-sm rounded border-orange-200 focus:ring-orange-500 focus:border-orange-500 py-1"
                        />
                      </div>
                      <button
                        onClick={handleAddFtp}
                        disabled={isSaving || !newFtp}
                        className="bg-orange-800 text-white p-1.5 rounded hover:bg-orange-900 transition-colors disabled:opacity-50"
                        title="Añadir FTP"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* FTP List */}
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {metrics?.ftpHistory && metrics.ftpHistory.length > 0 ? (
                        [...metrics.ftpHistory]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-white p-2 rounded border border-orange-100 text-sm"
                            >
                              <div>
                                <span className="font-bold text-gray-900">
                                  {entry.ftp}W
                                </span>
                                <span className="text-gray-400 mx-2 text-xs">
                                  desde
                                </span>
                                <span className="text-orange-600 font-medium">
                                  {formatDate(entry.date)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteFtp(entry.date)}
                                className="text-red-300 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 1 0 002 2h8a2 1 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))
                      ) : (
                        <p className="text-center text-xs text-orange-400 italic py-2">
                          Sin historial (usa 200W por defecto)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                <span>Basado en {metrics.activityCount} actividades</span>
                <span>
                  Último entreno: {formatDate(metrics.lastActivityDate)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay datos suficientes para calcular métricas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
