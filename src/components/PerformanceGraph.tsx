import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Bar,
} from 'recharts'

interface Point {
  date: string
  ctl: number
  atl: number
  tsb: number
  tss: number
  ftp: number
}

interface Props {
  data: Point[]
}

export default function PerformanceGraph({ data }: Props) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-xl border border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCtl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelFormatter={formatDate}
            formatter={(value: number | undefined) => [
              value !== undefined ? Math.round(value) : 0,
              '',
            ]}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

          {/* TSB - Form (Area or Line) */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="tsb"
            name="Form (TSB)"
            stroke="#f59e0b"
            fill="#fef3c7"
            fillOpacity={0.3}
            strokeWidth={2}
          />

          {/* TSS - Load (Bar) */}
          <Bar
            yAxisId="left"
            dataKey="tss"
            name="TSS"
            fill="#ef4444"
            opacity={0.3}
            radius={[2, 2, 0, 0]}
          />

          {/* ATL - Fatigue */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="atl"
            name="Fatigue (ATL)"
            stroke="#ec4899"
            strokeWidth={2}
            dot={false}
          />

          {/* CTL - Fitness */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="ctl"
            name="Fitness (CTL)"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />

          {/* FTP - Threshold */}
          <Line
            yAxisId="left"
            type="stepAfter"
            dataKey="ftp"
            name="FTP"
            stroke="#64748b"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
