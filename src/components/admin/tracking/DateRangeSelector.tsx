'use client'

import { Button } from '@heroui/react'

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onApply: () => void
}

export const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply
}: DateRangeSelectorProps) => {
  // 快捷日期选择
  const setQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    onStartDateChange(start.toISOString().split('T')[0])
    onEndDateChange(end.toISOString().split('T')[0])
  }

  return (
    <div className="flex flex-wrap gap-3 items-end mb-6">
      <div className="flex gap-2">
        <Button size="sm" variant="flat" onPress={() => setQuickRange(7)}>
          近7天
        </Button>
        <Button size="sm" variant="flat" onPress={() => setQuickRange(30)}>
          近30天
        </Button>
        <Button size="sm" variant="flat" onPress={() => setQuickRange(90)}>
          近90天
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-default-200 bg-default-100 text-sm"
        />
        <span className="text-default-500">至</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-default-200 bg-default-100 text-sm"
        />
      </div>
      <Button color="primary" size="sm" onPress={onApply}>
        查询
      </Button>
    </div>
  )
}
