'use client'
import { useRef } from 'react'

import { useScroll, useTransform } from 'framer-motion'
import { motion } from 'framer-motion'
import Image from 'next/image'

import { cn } from '@/lib/utils'

export const ParallaxScroll = ({
  images,
  className
}: {
  images: string[]
  className?: string
}) => {
  const gridRef = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    container: gridRef,
    offset: ['start start', 'end start']
  })

  // 定义交替的动画效果
  const translateUp = useTransform(scrollYProgress, [0, 1], [0, -200])
  const translateDown = useTransform(scrollYProgress, [0, 1], [0, 200])

  // 分割图片为5列
  const columnCount = 5
  const itemsPerColumn = Math.ceil(images.length / columnCount)
  const columns = Array.from({ length: columnCount }, (_, i) =>
    images.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
  )

  return (
    <div
      className={cn('h-[40rem] items-start overflow-y-auto w-full', className)}
      ref={gridRef}
    >
      <div
        className="grid grid-cols-3 2xl:grid-cols-5 items-start mx-auto gap-10"
        ref={gridRef}
      >
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className={cn('grid gap-10 w-fit', {
              // 在小于lg时隐藏第4、5列
              'hidden 2xl:grid': colIndex === 0 || colIndex === 4
            })}
          >
            {column.map((el, idx) => (
              <motion.div
                key={`grid-${colIndex}-${idx}`}
                style={{
                  // 奇数列向上，偶数列向下
                  y: colIndex % 2 === 0 ? translateUp : translateDown
                }}
                className="aspect-[3/4]"
              >
                <Image
                  src={el}
                  className="object-cover rounded-lg gap-10"
                  height="400"
                  width="400"
                  alt="thumbnail"
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
