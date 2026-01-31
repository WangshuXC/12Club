'use client'

import { Spinner } from '@heroui/react'
import type { TrendDataPoint } from '@/app/admin/tracking/actions'

interface LineChartProps {
  data: TrendDataPoint[]
  loading: boolean
}

// 简单折线图组件
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

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const padding = 40
  const chartWidth = 800
  const chartHeight = 200

  // 计算数据范围
  // Y 轴从 0 开始，到最大值（至少为 1）
  const chartMin = 0
  const chartMax = Math.max(maxValue, 1)
  const effectiveRange = chartMax - chartMin

  // 计算点的位置
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (chartWidth - padding * 2),
    y:
      chartHeight -
      padding -
      ((d.value - chartMin) / effectiveRange) * (chartHeight - padding * 2),
    value: d.value,
    date: d.date
  }))

  // 生成折线路径
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // 生成面积路径
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  // Y轴刻度 - 从 0 到最大值，均匀分布 5 个刻度
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const value = chartMin + (effectiveRange * (4 - i)) / 4
    return {
      value: Math.round(value),
      y: padding + (i / 4) * (chartHeight - padding * 2)
    }
  })

  // X轴标签（显示部分日期）
  const xLabels = data.filter(
    (_, i) =>
      i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0
  )

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        className="w-full min-w-[600px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 网格线 */}
        {yTicks.map((tick, i) => (
          <line
            key={i}
            x1={padding}
            y1={tick.y}
            x2={chartWidth - padding}
            y2={tick.y}
            stroke="currentColor"
            strokeOpacity={0.1}
          />
        ))}

        {/* Y轴刻度标签 */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={padding - 8}
            y={tick.y + 4}
            textAnchor="end"
            className="text-xs fill-default-400"
          >
            {tick.value}
          </text>
        ))}

        {/* 面积填充 */}
        <path
          d={areaPath}
          fill="hsl(var(--heroui-primary))"
          fillOpacity={0.1}
        />

        {/* 折线 */}
        <path
          d={linePath}
          fill="none"
          stroke="hsl(var(--heroui-primary))"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="hsl(var(--heroui-primary))"
              className="hover:r-6 transition-all"
            />
            <title>{`${p.date}: ${p.value}`}</title>
          </g>
        ))}

        {/* X轴标签 */}
        {xLabels.map((d, i) => {
          const point = points.find((p) => p.date === d.date)
          if (!point) return null
          return (
            <text
              key={i}
              x={point.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              className="text-xs fill-default-400"
            >
              {d.date.slice(5)} {/* 只显示月-日 */}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
