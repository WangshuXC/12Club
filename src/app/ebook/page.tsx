import type { Metadata } from 'next'
import { Button } from '@heroui/button'
import { Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '电子书 - 12Club',
  description: '12Club 电子书阅读'
}

export default function EbookPage() {
  return (
    <div className="w-full flex flex-col gap-2">
      <iframe
        src="http://12club.nankai.edu.cn/12ebook/"
        className="w-full h-[calc(100dvh-240px)] rounded-xl border border-default-200 shadow-lg"
        title="电子书阅读器"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
      <div className="flex justify-center gap-4">
        <Button
          as={Link}
          href="http://12club.nankai.edu.cn/openlist/@s/kwiFeWxH"
          target="_blank"
          color="primary"
          size="md"
          startContent={<Download size={16} />}
        >
          下载电子书
        </Button>
        <Button
          as={Link}
          href="http://12club.nankai.edu.cn/12ebook/"
          target="_blank"
          color="primary"
          size="md"
          startContent={<ExternalLink size={16} />}
        >
          新窗口打开
        </Button>
      </div>
    </div>
  )
}
