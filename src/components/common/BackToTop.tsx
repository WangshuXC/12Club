'use client'

import { useEffect, useState } from 'react'

import { Button } from '@heroui/react'
import { ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import FadeContent from '../ui/FadeContent'

export const BackToTop = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // if (!show) {
  //   return null
  // }

  return (
    <FadeContent
      blur={true}
      duration={800}
      easing="ease-in-out"
      initialOpacity={0}
      show={show}
      className={cn('z-50 fixed bottom-12 right-6')}
    >
      <Button
        isIconOnly
        color="primary"
        onPress={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
    </FadeContent>
  )
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
