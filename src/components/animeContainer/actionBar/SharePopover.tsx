'use client'

import { useEffect, useRef, useState } from 'react'

import {
  addToast,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Share } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Copy } from '@/utils/copy'

import { ActionButton } from './ActionButton'

interface SharePopoverProps {
  shareUrl: string
  title: string
  coverImage: string
  onCopy: () => void
}

const QR_SIZE = 180

export const SharePopover = ({
  shareUrl,
  title,
  coverImage,
  onCopy
}: SharePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&margin=0&data=${encodeURIComponent(
    shareUrl
  )}`

  // 组件挂载后立即预加载二维码，避免 hover 时才请求导致延迟
  useEffect(() => {
    const img = new window.Image()
    img.src = qrSrc
    img.onload = () => setQrLoaded(true)
  }, [qrSrc])

  const handleEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setIsOpen(true)
  }

  const handleLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }

    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleCopy = () => {
    Copy(shareUrl)
    onCopy()
  }

  return (
    <>
      {/* 小屏（<lg）：仅显示普通分享按钮，点击直接复制 */}
      <div className="inline-flex lg:hidden">
        <ActionButton
          icon={<Share className="size-5 sm:size-6" />}
          label="分享"
          tooltip="复制分享链接"
          onPress={handleCopy}
        />
      </div>

      {/* 大屏（≥lg）：hover 显示带二维码/封面的 Popover */}
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="hidden lg:inline-flex"
      >
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom"
        shouldCloseOnBlur={false}
        triggerType="menu"
      >
        <PopoverTrigger>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'inline-flex items-center gap-2 cursor-pointer rounded-medium px-3 sm:px-4 h-9 sm:h-12',
              'text-default-600 hover:text-primary hover:bg-default-100 active:scale-[0.97]',
              'text-sm sm:text-base transition-all'
            )}
            aria-label="分享"
          >
            <Share className="size-5 sm:size-6 shrink-0" />
            <span className="relative inline-block overflow-hidden h-5 sm:h-6 leading-5 sm:leading-6">
              {/* 占位：以最长文案撑开固定宽度，避免文字切换导致按钮尺寸抖动 */}
              <span
                aria-hidden
                className="invisible whitespace-nowrap"
              >
                点击复制链接
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? 'copy' : 'share'}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-start whitespace-nowrap"
                >
                  {isOpen ? '点击复制链接' : '分享'}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div
            className="p-4 flex gap-4 items-stretch"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {/* 左侧：资源封面 + 复制链接 */}
            <div className="flex flex-col gap-3 w-[150px]">
              <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-default-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">{title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full h-9 hover:cursor-pointer rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                复制分享链接
              </button>
            </div>

            {/* 右侧：二维码 */}
            <div className="flex flex-col items-center justify-between gap-2 py-1">
              <div className="relative w-[180px] h-[180px] rounded-md overflow-hidden bg-white p-1 border border-default-200">
                {!qrLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-default-100 animate-pulse text-xs text-default-500">
                    生成中...
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt="扫码分享"
                  width={QR_SIZE}
                  height={QR_SIZE}
                  className="w-full h-full"
                  onLoad={() => setQrLoaded(true)}
                  onError={() => {
                    addToast({
                      title: '二维码加载失败',
                      color: 'danger'
                    })
                  }}
                />
              </div>
              <p className="text-xs text-default-600 text-center leading-tight">
                手机扫码观看 / 分享
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </>
  )
}
