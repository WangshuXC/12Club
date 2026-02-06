'use client'

import React, { useEffect, useRef } from 'react'

import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface VideoPlayerProps {
  src: string
  className?: string
}

export const PlyrPlayer = ({ src, className = '' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Plyr | null>(null)

  useEffect(() => {
    if (
      videoRef.current &&
      !playerRef.current &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    ) {
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'captions',
          'settings',
          'pip',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed']
      })
    }
  }, [src])

  return (
    <video ref={videoRef} className={`plyr-react ${className}`} playsInline>
      <source src={src} type="video/mp4" />
    </video>
  )
}
