'use client'

import { Spinner } from '@heroui/react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

import type { TrendDataPoint } from '@/app/admin/tracking/actions'

interface LineChartProps {
  data: TrendDataPoint[]
  loading: boolean
}

export const LineChart = ({ data, loading }: LineChartProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-default-500">
        暂无趋势数据
      </div>
    )
  }

  const isHourly = data.length > 0 && data[0].date.includes('T')

  const formatTimeLabel = (value: string | number) => {
    const date = String(value)

    return isHourly ? date.split('T')[1] : date.slice(5)
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--heroui-primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--heroui-primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            strokeOpacity={0.1}
            vertical={false}
          />
          <XAxis
            // The complete timestamp is the category key. Hour-only labels repeat
            // across a 24-hour range and can otherwise point the tooltip at a
            // different data point with the same clock time.
            dataKey="date"
            tickFormatter={formatTimeLabel}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="fill-default-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            className="fill-default-400"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--heroui-content1))',
              borderColor: 'hsl(var(--heroui-default-200))',
              borderRadius: '8px',
              fontSize: '13px'
            }}
            labelFormatter={(label) =>
              `${isHourly ? '时间' : '日期'}: ${formatTimeLabel(label)}`
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [
              `${Number(value).toLocaleString()}`,
              '数量'
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--heroui-primary))"
            strokeWidth={2}
            fill="url(#colorValue)"
            dot={{ r: 3, fill: 'hsl(var(--heroui-primary))' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
