'use client'

import { FileText } from 'lucide-react'

import type { BookTocItem, ReaderFile } from '@/types/common/reader'

type FileListProps = {
  mode: 'files'
  files: ReaderFile[]
  currentIndex: number
  onSelect: (index: number) => void
}

type BookTocProps = {
  mode: 'toc'
  toc: BookTocItem[]
  onSelect: (href: string) => void
}

type ChapterListProps = FileListProps | BookTocProps

const FORMAT_LABEL: Record<string, string> = {
  epub: 'EPUB',
  mobi: 'MOBI',
  azw3: 'AZW3',
  fb2: 'FB2',
  cbz: 'CBZ',
  pdf: 'PDF',
  txt: 'TXT',
  unknown: '未知'
}

// 递归渲染书内目录项
const TocItem = ({
  item,
  depth,
  onSelect
}: {
  item: BookTocItem
  depth: number
  onSelect: (href: string) => void
}) => {
  const hasChildren = !!item.subitems?.length

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(item.href)}
        style={{ paddingLeft: 12 + depth * 14 }}
        className="w-full flex items-center gap-2 pr-3 py-2 rounded-lg text-left transition-colors cursor-pointer hover:bg-default-100 text-foreground"
      >
        <span className="flex-1 min-w-0 truncate text-sm">{item.label}</span>
      </button>
      {hasChildren && (
        <div>
          {item.subitems!.map((sub, idx) => (
            <TocItem
              key={`${depth}-${idx}-${sub.href}`}
              item={sub}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const ChapterList = (props: ChapterListProps) => {
  if (props.mode === 'toc') {
    const { toc, onSelect } = props

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-default-200">
          <p className="text-base font-semibold">书内章节</p>
          <p className="text-xs text-default-400">共 {toc.length} 项</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {toc.length === 0 ? (
            <p className="text-sm text-default-400 px-3 py-4 text-center">
              该书未提供目录
            </p>
          ) : (
            toc.map((item, idx) => (
              <TocItem
                key={`root-${idx}-${item.href}`}
                item={item}
                depth={0}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      </div>
    )
  }

  const { files, currentIndex, onSelect } = props

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-default-200">
        <p className="text-base font-semibold">文件列表</p>
        <p className="text-xs text-default-400">共 {files.length} 个文件</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.map((file) => {
          const active = file.index === currentIndex

          return (
            <button
              key={file.index}
              type="button"
              onClick={() => onSelect(file.index)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                active
                  ? 'bg-primary-50 text-primary font-semibold'
                  : 'hover:bg-default-100 text-foreground'
              }`}
            >
              <FileText
                className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-default-400'}`}
              />
              <span className="flex-1 min-w-0 truncate text-sm">
                {file.title}
              </span>
              <span className="text-[10px] text-default-400 shrink-0">
                {FORMAT_LABEL[file.format]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
