'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type DonutDatum = { label: string; count: number }

interface DonutChartProps {
  data: DonutDatum[]
  dataLabel: string
}

interface DonutTooltipProps {
  active?: boolean
  payload?: Array<{ payload?: DonutDatum }>
  dataLabel: string
}

const CHART_COLORS = [
  'hsl(var(--heroui-primary))',
  'hsl(var(--heroui-secondary))',
  'hsl(var(--heroui-success))',
  'hsl(var(--heroui-warning))',
  'hsl(var(--heroui-danger))',
  'hsl(var(--heroui-default-500))'
]

const DonutTooltip = ({ active, payload, dataLabel }: DonutTooltipProps) => {
  const item = payload?.[0]?.payload

  if (!active || !item) return null

  return (
    <div className="rounded-lg border border-default-200 bg-content1 px-3 py-2 text-[13px] shadow-sm">
      <p className="text-foreground">
        {dataLabel}: {item.label}
      </p>
      <p className="text-primary">数量: {item.count.toLocaleString('zh-CN')}</p>
    </div>
  )
}

export const DonutChart = ({ data, dataLabel }: DonutChartProps) => {
  return (
    <div className="h-52" aria-label="分布饼图" role="img">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={<DonutTooltip dataLabel={dataLabel} />}
            isAnimationActive={false}
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="transparent"
          >
            {data.map((item, index) => (
              <Cell
                key={item.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
