'use client'

import { useMemo } from 'react'

import DOMPurify from 'isomorphic-dompurify'

import { cn } from '@/lib/utils'
import { getMemeList } from '@/utils/memeUtils'

interface CommentContentProps {
  content: string
  className?: string
  isPreview?: boolean
}

function processHtmlContent(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // 遍历所有图片元素，替换为alt文本
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    const alt = img.getAttribute('alt');
    if (alt && alt.trim() !== '') {
      // 创建文本节点替换img标签
      const altTextNode = doc.createTextNode(`[${alt.replace(/\\"/g, '')}]`);
      img.parentNode?.replaceChild(altTextNode, img);
    } else {
      // 如果没有alt文本，直接移除图片
      img.remove();
    }
  });

  return doc.body.innerHTML;
}

export const CommentContent = ({
  content,
  className,
  isPreview = false
}: CommentContentProps) => {
  const memeList = getMemeList()
  const memeMap = new Map(memeList.map((meme) => [meme.displayName, meme]))

  // 检测内容是否包含HTML标签
  const hasHtmlTags = useMemo(() => {
    return /<[^>]+>/g.test(content)
  }, [content])

  // 处理HTML内容
  const renderHtmlContent = () => {
    if (!content) return null

    // 清理转义字符
    let processedContent = content
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')

    // 首先处理meme标记，将其转换为img标签
    processedContent = processedContent.replace(
      /\[meme_[^\[\]]+\]/g,
      (match) => {
        const meme = memeMap.get(match)
        if (meme) {
          return `<img src="${meme.path}" alt="${meme.displayName}" class="inline-block mx-1 rounded align-bottom ${isPreview ? 'w-10 h-10' : 'w-14 h-14'}" title="${meme.displayName}" loading="lazy" />`
        }

        return match
      }
    )

    // 使用DOMPurify清理HTML内容，允许安全的标签和属性
    const cleanHtml = DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'strike',
        'del',
        'a',
        'ul',
        'ol',
        'li',
        'blockquote',
        'code',
        'pre',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'img',
        'span',
        'div'
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'src',
        'alt',
        'title',
        'class',
        'loading'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):\/\/|data:image\/)/i
    })

    return (
      <div
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: processHtmlContent(cleanHtml) }}
      />
    )
  }

  // 将文本按照 meme 标记分割并渲染（原有逻辑）
  const renderTextContent = () => {
    if (!content) return null

    // 使用正则表达式分割文本，包含 meme 标记
    const parts = content.split(/(\[meme_[^[\]]+\])/)

    return parts.map((part, index) => {
      // 如果是 meme 标记
      if (part.match(/^\[meme_[^[\]]+\]$/)) {
        const meme = memeMap.get(part)
        if (meme) {
          return (
            <img
              key={`${part}-${index}`}
              src={meme.path}
              alt={meme.displayName}
              className={cn(
                'inline-block mx-1 rounded align-bottom',
                isPreview ? 'w-10 h-10' : 'w-14 h-14'
              )}
              title={meme.displayName}
              loading="lazy"
            />
          )
        }

        // 如果找不到对应的 meme，显示原文本
        return <span key={`${part}-${index}`}>{part}</span>
      }

      // 普通文本，保持换行
      return (
        <span key={`text-${index}`} className="whitespace-pre-wrap">
          {part}
        </span>
      )
    })
  }

  return (
    <div className={cn('leading-relaxed', className)}>
      {hasHtmlTags ? renderHtmlContent() : renderTextContent()}
    </div>
  )
}
