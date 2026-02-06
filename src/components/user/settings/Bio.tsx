'use client'

import { useState } from 'react'

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Textarea
} from '@heroui/react'

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { bioSchema } from '@/validations/user'

export const Bio = () => {
  const { user, setUser } = useUserStore((state) => state)
  const [bio, setBio] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const result = bioSchema.safeParse({ bio })
    if (!result.success) {
      setError(result.error.errors[0].message)
    } else {
      setError('')
      setUser({ ...user, bio })
      setLoading(true)

      const res = await FetchPost<object>('/user/setting/bio', { bio })
      ErrorHandler(res, () => {
        addToast({
          title: '成功',
          description: '更新签名成功',
          color: 'success'
        })
        setBio('')
      })

      setLoading(false)
    }
  }

  return (
    <Card className="w-full text-sm">
      <CardHeader>
        <h2 className="text-xl font-medium">签名</h2>
      </CardHeader>
      <CardBody className="py-0 space-y-4">
        <div>
          <p>这是您的签名设置, 您的签名将会被显示在您的主页上</p>
        </div>
        <Textarea
          label="签名"
          autoComplete="text"
          defaultValue={user.bio}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          isInvalid={!!error}
          errorMessage={error}
        />
      </CardBody>

      <CardFooter className="flex-wrap">
        <p className="text-default-500">签名最大长度为 107, 可以是任意字符</p>

        <Button
          color="primary"
          variant="solid"
          className="ml-auto"
          onPress={handleSave}
          isLoading={loading}
          disabled={loading}
        >
          保存
        </Button>
      </CardFooter>
    </Card>
  )
}
