'use client'

import { useEffect, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import AnnouncementCard from './AnnouncementCard'

import type { Announcement } from '@/types/api/announcement'

export const AnnouncementCarousel = ({ announcements }: { announcements: Announcement[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    // 如果没有公告或鼠标悬停，不启动定时器
    if (!announcements?.length || isHovered) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % announcements.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isHovered, announcements?.length])

  // 将条件返回移到所有 Hooks 之后
  if (!announcements?.length) return null

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentSlide(
      (prev) => (prev + newDirection + announcements.length) % announcements.length
    )
  }

  return (
    <div
      className="relative h-[200px] xl:h-[300px] w-full mt-10 group touch-pan-y flex items-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.4, ease: 'easeInOut' },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1)
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1)
            }
          }}
          className="absolute w-full h-full"
        >
          <AnnouncementCard announcements={announcements} currentSlide={currentSlide} />
        </motion.div>
      </AnimatePresence>

      <button
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 bg-gray-500/20 hover:bg-gray-500/40 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 touch:opacity-100 z-10",
          announcements?.length > 1 ? "hidden xl:block" : "hidden",
        )}
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 bg-gray-500/20 hover:bg-gray-500/40 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 touch:opacity-100 z-10",
          announcements?.length > 1 ? "hidden xl:block" : "hidden",
        )}
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className={cn(
        "absolute z-10 gap-1 -translate-x-1/2 bottom-8 left-1/2",
        announcements?.length > 1 ? "flex" : "hidden"
      )}>
        {announcements?.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentSlide
              ? 'bg-primary w-4'
              : 'bg-foreground/20 hover:bg-foreground/40'
            }`}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1)
              setCurrentSlide(index)
            }}
          />
        ))}
      </div>
    </div>
  )
}
