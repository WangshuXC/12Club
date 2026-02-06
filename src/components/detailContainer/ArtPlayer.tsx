'use client'

import React, { useEffect, useRef } from 'react'

import Artplayer from 'artplayer'

interface VideoPlayerProps {
  src: string
  className?: string
  onPlay?: () => void
}

export const ArtPlayer = ({ src, className = '', onPlay }: VideoPlayerProps) => {
  const artRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Artplayer | null>(null)
  const hasReportedPlayRef = useRef(false)

  useEffect(() => {
    if (
      artRef.current &&
      !playerRef.current &&
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    ) {
      playerRef.current = new Artplayer({
        container: artRef.current,
        url: src,
        volume: 1,
        muted: false,
        autoplay: false,
        autoSize: false,
        autoMini: true,
        setting: true,
        loop: false,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        autoOrientation: true,
        airplay: true,
        theme: '#0CA5E9',
        mutex: true
      })

      // 监听播放事件，只在首次播放时上报
      playerRef.current.on('play', () => {
        if (!hasReportedPlayRef.current) {
          hasReportedPlayRef.current = true
          onPlay?.()
        }
      })

      // 确保鼠标指针正常显示
      if (artRef.current) {
        artRef.current.style.cursor = 'default'

        // 为播放器容器添加鼠标事件监听
        const container = artRef.current.querySelector('.art-video-player')
        if (container) {
          ;(container as HTMLElement).style.cursor = 'default'
        }
      }
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy(false)
        playerRef.current = null
      }
    }
  }, [src, onPlay])

  // 当 src 变化时重置上报状态
  useEffect(() => {
    hasReportedPlayRef.current = false
  }, [src])

  return (
    <div
      ref={artRef}
      className={`w-full aspect-[16/9] z-[1000] ${className}`}
    />
  )
}
