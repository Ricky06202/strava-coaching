import React from 'react'

interface PerformanceMetrics {
  ctl: number // Fitness
  atl: number // Fatigue
  tsb: number // Form
  lastActivityDate: string
  activityCount: number
}

interface PerformanceModalProps {
  isOpen: boolean
  onClose: () => void
  metrics: PerformanceMetrics | null
  isLoading: boolean
  athleteName: string
}

export default function PerformanceModal({
  isOpen,
  onClose,
  metrics,
  isLoading,
  athleteName,
}: PerformanceModalProps) {
  if (!isOpen) return null

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
                <p className={`text-lg font-bold ${getTsbColor(metrics.tsb)}`}>
                  {getTsbStatus(metrics.tsb)}
                </p>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                <span>Basado en {metrics.activityCount} actividades</span>
                <span>
                  Último entreno:{' '}
                  {new Date(metrics.lastActivityDate).toLocaleDateString()}
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
