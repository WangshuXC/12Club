'use client'

import { useState } from 'react'

import { Button } from '@heroui/react'
import {
  addToast,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'
import { Textarea } from '@heroui/react'
import { MoreVertical } from 'lucide-react'

import { useUserStore } from '@/store/userStore'
import { FetchDelete, FetchPut } from '@/utils/fetch'

import type { AdminComment } from '@/types/api/admin'

interface Props {
  initialComment: AdminComment
  onDelete: (commentId: number) => void
  onUpdate: (commentId: number, newContent: string) => void
}

export const CommentEdit = ({ initialComment, onDelete, onUpdate }: Props) => {
  const currentUser = useUserStore((state) => state.user)

  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete
  } = useDisclosure()
  const [deleting, setDeleting] = useState(false)
  const handleDeleteComment = async () => {
    setDeleting(true)
    const res = await FetchDelete('/admin/comment', {
      commentId: initialComment.id
    })
    setDeleting(false)

    if (typeof res === 'string') {
      addToast({
        title: '错误',
        description: res,
        color: 'danger'
      })
    } else {
      onCloseDelete()
      addToast({
        title: '成功',
        description: '评论删除成功',
        color: 'success'
      })

      // 调用删除回调，从UI中移除该评论
      onDelete(initialComment.id)
    }
  }

  const {
    isOpen: isOpenEdit,
    onOpen: onOpenEdit,
    onClose: onCloseEdit
  } = useDisclosure()
  const [editContent, setEditContent] = useState('')
  const [updating, setUpdating] = useState(false)
  const handleUpdateComment = async () => {
    if (!editContent.trim()) {
      addToast({
        title: '错误',
        description: '评论内容不可为空',
        color: 'danger'
      })
      return
    }

    setUpdating(true)
    const res = await FetchPut('/admin/comment', {
      commentId: initialComment.id,
      content: editContent.trim()
    })
    setUpdating(false)

    if (typeof res === 'string') {
      addToast({
        title: '错误',
        description: res,
        color: 'danger'
      })
    } else {
      onCloseEdit()
      addToast({
        title: '成功',
        description: '更新评论成功!',
        color: 'success'
      })

      // 调用更新回调，更新UI中的评论内容
      onUpdate(initialComment.id, editContent.trim())
      setEditContent('')
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            isDisabled={currentUser.role < 3}
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem
            key="edit"
            onPress={() => {
              setEditContent(initialComment.content)
              onOpenEdit()
            }}
          >
            编辑
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            onPress={onOpenDelete}
          >
            删除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpenEdit} onClose={onCloseEdit} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">编辑评论</ModalHeader>
          <ModalBody>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setEditContent('')
                onCloseEdit()
              }}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleUpdateComment}
              disabled={updating}
              isLoading={updating}
            >
              确定
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
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCloseDelete}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteComment}
              disabled={deleting}
              isLoading={deleting}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
