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
  Tooltip,
  useDisclosure,
  addToast
} from '@heroui/react'
import { MessageCircleQuestion } from 'lucide-react'

import { FetchPost } from '@/utils/fetch'

interface Props {
  name: string
  dbId: string
}

export const FeedbackButton = ({ name, dbId }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [inputValue, setInputValue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitFeedback = async () => {
    setSubmitting(true)
    const res = await FetchPost<object>('/detail/feedback', {
      dbId,
      content: inputValue
    })
    if (typeof res === 'string') {
      addToast({
        title: '提交反馈失败',
        description: res,
        color: 'danger'
      })
    } else {
      setInputValue('')
      addToast({
        title: '提交反馈成功',
        color: 'success'
      })
    }

    onClose()
    setSubmitting(false)
  }

  return (
    <>
      <Tooltip content="资源反馈">
        <Button
          variant="bordered"
          isIconOnly
          aria-label="资源反馈"
          onPress={onOpen}
        >
          <MessageCircleQuestion className="size-5" />
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            提交资源反馈
          </ModalHeader>
          <ModalBody>
            <Textarea
              label={`资源 ${name} 的反馈`}
              isRequired
              placeholder="请填写反馈内容 (资源名称错误, 下载资源失效, 资源介绍错误等, 请尽可能详细并指明具体的位置)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
    </>
  )
}
