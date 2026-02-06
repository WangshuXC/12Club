'use client'

import { useState } from 'react'

import { addToast, Button, Checkbox, Input, Link } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Config } from '@/config/config'
import { useUserStore } from '@/store/userStore'
import { hashPassword } from '@/utils/algorithm'
import { ErrorHandler } from '@/utils/errorHandler'
import { FetchPost } from '@/utils/fetch'
import { registerSchema } from '@/validations/auth'

import { TextDivider } from './TextDivider'

import type { UserState } from '@/store/userStore'

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
  const { setUser } = useUserStore((state) => state)
  const router = useRouter()
  const [isAgree, setIsAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  const [isVisible, setIsVisible] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)
  const toggleVisibility = () => setIsVisible(!isVisible)
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

  const { control, watch, reset } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const handleRegister = async () => {
    if (!isAgree) {
      addToast({
        title: '错误',
        description: '请您勾选同意我们的用户协议',
        color: 'danger'
      })
      return
    }

    setLoading(true)
    const formData = watch()

    const validation = registerSchema.safeParse(formData)
    if (!validation.success) {
      addToast({
        title: '错误',
        description: validation.error.issues[0].message,
        color: 'danger'
      })
      setLoading(false)
      return
    }

    const hashedPassword = await hashPassword(formData.password)
    const res = await FetchPost<UserState>('/auth/register', {
      name: formData.name,
      email: formData.email,
      password: hashedPassword
    })

    setLoading(false)

    ErrorHandler(res, (value) => {
      setUser(value)
      reset()
      addToast({
        title: '成功',
        description: '注册成功!',
        color: 'success'
      })
      router.push(`/user/${value.uid}`)
    })
  }

  return (
    <form className="flex flex-col space-y-4 w-72">
      <Controller
        name="name"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="用户名"
            type="name"
            variant="bordered"
            autoComplete="username"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="邮箱"
            type="email"
            variant="bordered"
            autoComplete="email"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
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
            autoComplete="new-password"
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
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
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="确认密码"
            type={isConfirmVisible ? 'text' : 'password'}
            variant="bordered"
            autoComplete="new-password"
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
            endContent={
              <button
                aria-label="toggle confirm password visibility"
                className="focus:outline-none"
                type="button"
                onClick={toggleConfirmVisibility}
              >
                {isConfirmVisible ? (
                  <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <Eye className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
          />
        )}
      />

      <div>
        <Checkbox isSelected={isAgree} onValueChange={setIsAgree}>
          <span>我同意</span>
        </Checkbox>
        <Link className="ml-1" href="/doc/notice/privacy">
          {Config.titleShort} 用户协议
        </Link>
      </div>

      <Button
        color="primary"
        className="w-full"
        isLoading={loading}
        onPress={handleRegister}
      >
        注册
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
        <span className="mr-2">已经有账号了?</span>
        <Link href="/login">登录账号</Link>
      </div>
    </form>
  )
}
