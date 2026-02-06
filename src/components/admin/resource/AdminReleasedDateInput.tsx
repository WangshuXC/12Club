'use client'

import { Input } from '@heroui/react'

interface Props {
  date: string
  onChange: (date: string) => void
  errors?: string
}

export const AdminReleasedDateInput = ({ date, onChange, errors }: Props) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (value.includes('-')) {
      const parts = value.split('-')

      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4)
      }

      if (parts[1]) {
        const monthNum = parseInt(parts[1])
        if (monthNum > 12) {
          parts[1] = '12'
        }
      }

      if (parts[2]) {
        const dayNum = parseInt(parts[2])
        if (dayNum > 31) {
          parts[2] = '31'
        }
      }

      value = parts.join('-')
    } else {
      value = value.replace(/\D/g, '')

      if (value.length > 8) {
        value = value.slice(0, 8)
      }

      if (value.length >= 4) {
        const year = value.slice(0, 4)
        const month = value.slice(4, 6)
        const day = value.slice(6, 8)

        value = year

        if (month) {
          value += `-${month}`
        }

        if (day) {
          value += `-${day}`
        }
      }
    }

    onChange(value)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">资源发行日期 (可选)</label>
      <Input
        placeholder="请输入资源的发行日期"
        value={date}
        onChange={handleDateChange}
        className="max-w-xs"
        isInvalid={!!errors}
        errorMessage={errors}
        description={
          <p className="text-sm text-default-500 mt-1">
            格式: YYYY-MM-DD (例如 2025-10-07)
          </p>
        }
      />
    </div>
  )
} 