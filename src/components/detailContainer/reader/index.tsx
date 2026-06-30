'use client'

import { useMemo } from 'react'

import { Button, useDisclosure } from '@heroui/react'
import { BookOpen } from 'lucide-react'

import { ReaderModal } from './ReaderModal'
import { buildReaderFiles } from './loader'

import type { PlayListItem } from '@/types/common/detail-container'

interface ReaderEntryProps {
  id: string
  title: string
  playList: PlayListItem[]
}

export const ReaderEntry = ({ id, title, playList }: ReaderEntryProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const files = useMemo(() => buildReaderFiles(playList), [playList])

  if (files.length === 0) {
    return null
  }

  const handleOpen = () => {
    window?.umami?.track('在线阅读', { dbId: id })
    onOpen()
  }

  return (
    <>
      <Button
        color="primary"
        variant="shadow"
        aria-label="在线阅读"
        startContent={<BookOpen className="size-5" />}
        onPress={handleOpen}
      >
        在线阅读
      </Button>

      <ReaderModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        files={files}
      />
    </>
  )
}
