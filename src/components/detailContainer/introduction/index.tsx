'use client'
import { useState, useEffect } from 'react'

import { Card, CardBody } from '@heroui/react'
import { usePathname } from 'next/navigation'

import { Info } from './Info'

import type { Introduction } from '@/types/common/detail-container'

interface Props {
  intro: Introduction
  tagList?: string[]
}

const typeMap = {
  comic: '漫画',
  novel: '小说',
  animate: '动画'
}

export const IntroductionTab = ({ intro }: Props) => {
  const pathname = usePathname()
  const [typeLabel, setTypeLabel] = useState('')
  useEffect(() => {
    const matchedEntry = Object.entries(typeMap).find(([key]) =>
      pathname.startsWith(`/${key}`)
    )

    if (matchedEntry) {
      setTypeLabel(matchedEntry[1])
    }
  }, [pathname])

  return (
    <Card className="p-1 lg:p-8">
      <CardBody className="p-4 space-y-6">
        <div className="max-w-none">
          <h2 className="text-2xl pb-4 font-medium">{typeLabel}简介</h2>
          <div className="whitespace-pre-line">
            {intro.text.replace(/<br\s?\/?>/gi, '\n\n')}
          </div>
        </div>

        <Info intro={intro} type={typeLabel} />
      </CardBody>
    </Card>
  )
}
