'use client'

import { useState } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast
} from '@heroui/react'
import { FetchPost } from '@/utils/fetch'

interface FeedbackModalProps {
  dbId: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export const FeedbackModal = ({
  dbId,
  title,
  isOpen,
  onClose
}: FeedbackModalProps) => {
  const [feedbackInput, setFeedbackInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitFeedback = async () => {
    setSubmitting(true)
    const res = await FetchPost<{}>('/detail/feedback', {
      dbId,
      content: feedbackInput
    })
    if (typeof res === 'string') {
      addToast({
        title: '提交反馈失败',
        description: res,
        color: 'danger'
      })
    } else {
      setFeedbackInput('')
      addToast({
        title: '提交反馈成功',
        color: 'success'
      })
    }
    onClose()
    setSubmitting(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        wrapper: 'z-[9999]',
        backdrop: 'z-[9998]'
      }}
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          提交资源反馈
        </ModalHeader>
        <ModalBody>
          <Textarea
            label={`资源 ${title} 的反馈`}
            isRequired
            placeholder="请填写反馈内容 (资源名称错误, 下载资源失效, 资源介绍错误等, 请尽可能详细并指明具体的位置)"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmitFeedback}
            isDisabled={submitting}
            isLoading={submitting}
          >
            提交
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
