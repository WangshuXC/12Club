'use client'

import { useState } from 'react'

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from '@heroui/react'

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { usernameSchema } from '@/validations/user'

export const Username = () => {
  const { user, setUser } = useUserStore((state) => state)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleSave = async () => {
    const result = usernameSchema.safeParse({ username })
    if (!result.success) {
      setError(result.error.errors[0].message)
    } else {
      setError('')

      setLoading(true)

      const res = await FetchPost<object>('/user/setting/username', {
        username
      })
      ErrorHandler(res, () => {
        addToast({
          title: '成功',
          description: '更新用户名成功',
          color: 'success'
        })
        setUser({ ...user, name: username })
        setUsername('')
      })
      setLoading(false)
    }
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">用户名</h2>
      </CardHeader>
      <CardBody className="py-0 space-y-4">
        <div>
          <p>这是您的用户名设置, 您的用户名是唯一的</p>
        </div>
        <Input
          label="用户名"
          autoComplete="text"
          defaultValue={user.name}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          isInvalid={!!error}
          errorMessage={error}
        />
      </CardBody>

      <CardFooter className="flex-wrap">
        <p className="text-default-500">用户名长度最大为 17, 可以是任意字符</p>

        <Button
          color="primary"
          variant="solid"
          className="ml-auto"
          onPress={onOpen}
        >
          保存
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  您确定要更改用户名吗?
                </ModalHeader>
                <ModalBody>
                  <p>该操作不可撤销</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    关闭
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      handleSave()
                      onClose()
                    }}
                    isLoading={loading}
                    disabled={loading}
                  >
                    确定
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </CardFooter>
    </Card>
  )
}
