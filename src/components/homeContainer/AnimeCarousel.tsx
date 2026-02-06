'use client'
import { useState, useRef, useId, useEffect } from 'react'

import { IconArrowNarrowRight } from '@tabler/icons-react'
import Image from 'next/image'
import { useTransitionRouter } from 'next-view-transitions'
import { FaPlay } from 'react-icons/fa6'

import { upPage } from '@/lib/routerTransition'
import { cn } from '@/lib/utils'

interface SlideData {
    title: string
    href: string
    imageSrc: string
}

interface SlideProps {
    slide: SlideData
    index: number
    current: number
    handleSlideClick: (index: number) => void
}

const widthClassName = 'w-[60vmin] lg:w-[40vmin] 2xl:w-[30vmin]'

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null)
  const router = useTransitionRouter()
  const xRef = useRef(0)
  const yRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return

      const x = xRef.current
      const y = yRef.current

      slideRef.current.style.setProperty('--x', `${x}px`)
      slideRef.current.style.setProperty('--y', `${y}px`)

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current
    if (!el) return

    const r = el.getBoundingClientRect()
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2))
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2))
  }

  const handleMouseLeave = () => {
    xRef.current = 0
    yRef.current = 0
  }

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = '1'
  }

  const { imageSrc, href, title } = slide

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]" onClick={() => handleSlideClick(index)}>
      <li
        ref={slideRef}
        className={cn(
          'flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out aspect-[3/4] mx-[4vmin] z-10',
          widthClassName
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
                        current !== index
                          ? 'scale(0.98) rotateX(8deg)'
                          : 'scale(1) rotateX(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'bottom'
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full aspect-[3/4] bg-[#1D1F2F] rounded-xl overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform:
                            current === index
                              ? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)'
                              : 'none'
          }}
        >
          <Image
            className="absolute inset-0 w-[120%] h-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.5
            }}
            alt={title}
            src={imageSrc}
            fill
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          <div
            className={cn(
              'absolute inset-0 bg-black/30 transition-all duration-1000 opacity-100',
              current !== index && 'opacity-0'
            )}
          />
        </div>

        <article
          className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out ${current === index ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold  relative">
            {title}
          </h2>
          <div className="flex justify-center">
            <div
              role="button"
              onClick={() => {
                setTimeout(() => {
                  router.push(href, {
                    onTransitionReady: upPage
                  })
                }, 100)
              }}
              className="mt-6 cursor-pointer w-fit mx-auto text-white text-3xl flex justify-center items-center rounded-full hover:scale-[130%] hover:text-primary transition duration-200"
            >
              <FaPlay />
            </div>
          </div>
        </article>
      </li>
    </div>
  )
}

interface CarouselControlProps {
    type: string
    title: string
    handleClick: () => void
}

const CarouselControl = ({
  type,
  title,
  handleClick
}: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full  focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${type === 'previous' ? 'rotate-180' : ''
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  )
}

interface CarouselProps {
    slides: SlideData[]
}

export default function AnimeCarousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(Math.floor(slides.length / 2))

  const handlePreviousClick = () => {
    const previous = current - 1
    setCurrent(previous < 0 ? slides.length - 1 : previous)
  }

  const handleNextClick = () => {
    const next = current + 1
    setCurrent(next === slides.length ? 0 : next)
  }

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index)
    }
  }

  const id = useId()

  return (
    <div
      className={cn('relative aspect-[3/4] mx-auto', widthClassName)}
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-between w-full top-full mt-5">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  )
}
