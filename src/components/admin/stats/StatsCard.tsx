'use client'

import type { FC } from 'react'

import { Card, CardBody } from '@heroui/react'

export const StatsCard: FC<{ title: string; value: number }> = ({
  title,
  value
}) => (
  <Card className="w-full">
    <CardBody className="flex flex-col justify-between">
      <p className="text-sm font-medium tracking-wide text-default-500">
        {title}
      </p>
      <p className="text-xl font-semibold text-default-700">
        {value.toLocaleString()}
      </p>
    </CardBody>
  </Card>
)
