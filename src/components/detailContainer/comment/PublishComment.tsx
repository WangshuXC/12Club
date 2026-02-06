'use client'

import { useState, useRef } from 'react'

import { addToast, Button, Card, CardBody, CardHeader, Textarea } from '@heroui/react'
import { Send } from 'lucide-react'

import { CommentPreview } from '@/components/ui/MemePreview'
import { MemeSelector } from '@/components/ui/MemeSelector'
import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { insertMemeIntoText, type MemeItem } from '@/utils/memeUtils'

import type { ResourceComment } from '@/types/api/comment'

interface CreateCommentProps {
  id: string
  parentId?: number | null
  setNewComment: (newComment: ResourceComment[], newCommentId: number) => void
  onSuccess?: () => void
}

export const PublishComment = ({
  id,
  parentId = null,
  setNewComment,
  onSuccess
}: CreateCommentProps) => {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<any>(null)
  const user = useUserStore((state) => state.user)
  const isLoggedIn = user.uid > 0

  // 更新光标位置
  const handleTextareaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)
    setCursorPosition(e.target.selectionStart || 0)
  }

  // 处理光标位置变化
  const handleCursorChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    setCursorPosition(target.selectionStart || 0)
  }

  // 处理表情选择
  const handleMemeSelect = (meme: MemeItem) => {
    const { newText, newCursorPosition } = insertMemeIntoText(
      content,
      cursorPosition,
      meme.displayName
    )

    setContent(newText)
    setCursorPosition(newCursorPosition)

    // 重新聚焦到 textarea 并设置光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
      }
    }, 0)
  }

  const handlePublishComment = async () => {
    // 防止重复提交
    if (loading) {
      return
    }

    // 验证内容
    if (!content.trim()) {
      addToast({
        title: '错误',
        description: '评论内容不能为空',
        color: 'danger'
      })
      return
    }

    setLoading(true)

    try {
      const res = await FetchPost<{
        comment: ResourceComment[]
        newCommentId: number
      }>('/detail/comment', {
        id,
        parentId: parentId || null,
        content: content.trim()
      })

      ErrorHandler(res, (value) => {
        setNewComment(value.comment, value.newCommentId)
        addToast({
          title: '成功',
          description: '评论发布成功',
          color: 'success'
        })
        setContent('')
        onSuccess?.()
      })
    } catch (error) {
      addToast({
        title: '错误',
        description: '评论发布失败，请稍后重试',
        color: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-0 space-x-4"></CardHeader>
      <CardBody className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            label="评论输入框"
            value={content}
            onChange={handleTextareaChange}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            isDisabled={loading || !isLoggedIn}
            maxLength={10000}
            placeholder={isLoggedIn ? "请输入您的评论..." : "请先登录后再发表评论"}
          />
          <CommentPreview text={content} />
        </div>
        <div className="flex items-center justify-between">
          <MemeSelector
            onMemeSelect={handleMemeSelect}
            isDisabled={loading || !isLoggedIn}
          />
          <Button
            color="primary"
            onPress={handlePublishComment}
            isDisabled={loading || !content.trim() || !isLoggedIn}
            isLoading={loading}
            startContent={!loading && <Send className="size-4" />}
          >
            {loading ? '发布中...' : isLoggedIn ? '发布评论' : '请先登录'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
