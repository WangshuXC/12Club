'use client'

import { useState } from 'react'

import { addToast, Button, Input, Link } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUserStore } from '@/store/userStore'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { loginSchema } from '@/validations/auth'

import { TextDivider } from './TextDivider'

import type { UserState } from '@/store/userStore'

type LoginFormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const { setUser } = useUserStore((state) => state)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)

  const { control, watch, reset } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
      password: ''
    }
  })

  const handleLogin = async () => {
    setLoading(true)
    const res = await FetchPost<UserState>('/auth/login', {
      ...watch()
    })
    setLoading(false)

    ErrorHandler(res, (value) => {
      setUser(value)
      reset()
      addToast({
        title: '成功',
        description: '登录成功!',
        color: 'success'
      })
      window?.umami?.identify(
        value.uid.toString(),
        {
          name: value.name,
          email: value.email,
        }
      )
      router.push(`/user/${value.uid}`)
    })
  }

  return (
    <form className="w-72">
      <Controller
        name="name"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="用户名或邮箱"
            type="text"
            variant="bordered"
            autoComplete="username"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
            className="mb-4"
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="密码"
            type={isVisible ? 'text' : 'password'}
            variant="bordered"
            isInvalid={!!errors.password}
            autoComplete="current-password"
            errorMessage={errors.password?.message}
            className="mb-4"
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <Eye className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
          />
        )}
      />
      <Button
        color="primary"
        className="w-full"
        isDisabled={loading}
        isLoading={loading}
        onPress={handleLogin}
      >
        登录
      </Button>

      <TextDivider text="或" />

      <Button
        color="primary"
        variant="bordered"
        className="w-full mb-4"
        onPress={() => router.push('/forgot')}
      >
        忘记密码
      </Button>

      <div className="flex items-center">
        <span className="mr-2">没有账号?</span>
        <Link href="register">注册账号</Link>
      </div>
    </form>
  )
}
