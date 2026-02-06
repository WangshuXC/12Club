'use client'

import { FC } from 'react'

import { Divider } from '@heroui/react'

import { AdminStatistic } from './AdminStatistic'

export const Stats: FC = () => {
  return (
    <div className="space-y-6">
      <AdminStatistic />
      <Divider className="my-8" />
    </div>
  )
}
