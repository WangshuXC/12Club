'use client'

import { Divider } from '@heroui/react'

interface Props {
  name: string
  description?: string
  endContent?: React.ReactNode
  headerEndContent?: React.ReactNode
}

export const Header = ({
  name,
  description,
  endContent,
  headerEndContent
}: Props) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">
              <span>{name}</span>
            </h1>
            {description && (
              <p className="whitespace-pre-wrap text-default-500">
                {description}
              </p>
            )}
          </div>
          {headerEndContent}
        </div>
        {endContent}
      </div>
    </>
  )
}
