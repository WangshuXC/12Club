'use client'

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image
} from '@heroui/react'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'

interface ErrorComponentProps {
  error: string
  showReset?: boolean
  reset?: () => void
}

export const ErrorComponent = ({
  error,
  showReset = false,
  reset
}: ErrorComponentProps) => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center p-8 size-full">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex items-center pt-8">
          <div className="w-full flex flex-col justify-center items-center gap-y-4">
            <Image src="/error2.gif" className="size-40" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">出错了</h1>
              <p className="text-default-500">发生了一些意外情况</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-8">
          <div className="p-4 rounded-lg bg-danger-50">
            <p className="font-mono text-sm text-center text-danger">{error}</p>
          </div>
        </CardBody>
        <CardFooter className="flex flex-wrap justify-between gap-2 px-8 pb-8">
          <Button
            startContent={<ArrowLeft className="size-4" />}
            variant="flat"
            color="primary"
            onPress={() => router.back()}
          >
            返回上一页
          </Button>
          {showReset && (
            <Button
              startContent={<RefreshCw className="size-4" />}
              variant="flat"
              color="primary"
              onPress={() => reset?.()}
            >
              重试
            </Button>
          )}
          <Button
            startContent={<Home className="size-4" />}
            color="primary"
            onPress={() => router.push('/')}
          >
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 