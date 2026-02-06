'use client'

import { SetStateAction, useState } from 'react'

import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure
} from '@heroui/react'
import { convert } from 'html-to-text'
import { MoreHorizontal, Pencil, Trash2, TriangleAlert } from 'lucide-react'

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchDelete, FetchPost, FetchPut } from '@/utils/fetch'

import type { ResourceComment } from '@/types/api/comment'

interface Props {
  comment: ResourceComment
  setComments: (comments: SetStateAction<ResourceComment[]>) => void
}

export const CommentDropdown = ({ comment, setComments }: Props) => {
  const { user } = useUserStore((state) => state)

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()
  const [deleting, setDeleting] = useState(false)
  const handleDeleteComment = async () => {
    setDeleting(true)
    const res = await FetchDelete<{ comment: ResourceComment[] }>(
      '/detail/comment',
      {
        commentId: comment.id,
        resourceId: comment.resourceId
      }
    )
    ErrorHandler(res, () => {
      onCloseDelete()
      setComments(res.comment)
      addToast({
        title: '成功',
        description: '评论删除成功',
        color: 'success'
      })
    })
    setDeleting(false)
  }

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure()
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const handleStartEdit = () => {
    setEditContent(comment.content)
    onOpenEdit()
  }
  const handleSubmitEdit = async () => {
    setUpdating(true)
    const res = await FetchPut<{ comment: ResourceComment[] }>(
      '/detail/comment',
      {
        commentId: comment.id,
        resourceId: comment.resourceId,
        content: editContent
      }
    )
    if (typeof res === 'string') {
      addToast({
        title: '失败',
        description: res,
        color: 'danger'
      })
    } else {
      onCloseEdit()
      setComments(res.comment)
      addToast({
        title: '成功',
        description: '评论编辑成功',
        color: 'success'
      })
    }
  }

  const {
    isOpen: isOpenReport,
    onOpen: onOpenReport,
    onClose: onCloseReport
  } = useDisclosure()
  const [reportValue, setReportValue] = useState('')
  const [reporting, setReporting] = useState(false)
  const handleSubmitReport = async () => {
    setReporting(true)
    const res = await FetchPost<object>('/detail/comment/report', {
      commentId: comment.id,
      resourceId: comment.resourceId,
      content: reportValue
    })
    if (typeof res === 'string') {
      addToast({
        title: '失败',
        description: res,
        color: 'danger'
      })
    } else {
      setReportValue('')
      addToast({
        title: '成功',
        description: '提交举报成功',
        color: 'success'
      })
      onCloseReport()
      setReporting(false)
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="light" isIconOnly className="text-default-400">
            <MoreHorizontal aria-label="Galgame 评论操作" className="size-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Comment actions"
          disabledKeys={
            user.uid !== comment.userId && user.role < 3
              ? ['edit', 'delete']
              : ['']
          }
        >
          <DropdownItem
            key="edit"
            color="default"
            startContent={<Pencil className="size-4" />}
            onPress={handleStartEdit}
          >
            编辑评论
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<Trash2 className="size-4" />}
            onPress={onOpenDelete}
          >
            删除评论
          </DropdownItem>
          <DropdownItem
            key="report"
            startContent={<TriangleAlert className="size-4" />}
            onPress={onOpenReport}
          >
            举报评论
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenEdit} onClose={onCloseEdit}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            重新编辑评论
          </ModalHeader>
          <ModalBody>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseEdit}>
              取消
            </Button>
            <Button
              color="primary"
              isDisabled={updating}
              isLoading={updating}
              onPress={handleSubmitEdit}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenDelete} onClose={onCloseDelete} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">删除评论</ModalHeader>
          <ModalBody>
            <p>
              您确定要删除这条评论吗, 这将会删除该评论,
              以及所有回复该评论的评论, 该操作不可撤销
            </p>
            <p className="pl-4 border-l-4 border-primary-500">
              {comment.content}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              取消
            </Button>
            <Button
              color="danger"
              disabled={deleting}
              onPress={handleDeleteComment}
              isLoading={deleting}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenReport} onClose={onCloseReport}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">举报评论</ModalHeader>
          <ModalBody>
            <Textarea
              label={`举报 ${convert(comment.content).slice(0, 20)}`}
              isRequired
              placeholder="请填写举报原因"
              value={reportValue}
              onChange={(e) => setReportValue(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseReport}>
              取消
            </Button>
            <Button
              color="primary"
              isLoading={reporting}
              onPress={handleSubmitReport}
            >
              提交
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
