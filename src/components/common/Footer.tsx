'use client'

import { Config } from '@/config/config'
import Link from 'next/link'
import Image from 'next/image'
import { Popover, PopoverTrigger, PopoverContent, Button } from '@heroui/react'

export const Footer = () => {
  return (
    <footer className="w-full mt-8 text-sm border-t border-divider">
      <div className="px-2 mx-auto sm:px-6 container">
        <div className="flex flex-wrap justify-center gap-4 py-6 md:justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/favicon.ico"
              alt={Config.titleShort}
              width={30}
              height={30}
            />
            <span>
              © {new Date().getFullYear()} {Config.titleShort}
            </span>
          </Link>

          <div className="flex space-x-8">
            <Link href="/doc" className="flex items-center">
              帮助文档
            </Link>

            <Link href="/ebook" className="flex items-center">
              十周年电子书
            </Link>

            <Link
              href="https://github.com/WangshuXC"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              GitHub
            </Link>
          </div>

          <div className="flex space-x-8">
            <Popover placement="top">
              <PopoverTrigger>
                <Button>联系我们</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Image
                  src="/contactUs.png"
                  alt={Config.titleShort}
                  width={300}
                  height={300}
                  className="rounded-lg m-3"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </footer>
  )
}
