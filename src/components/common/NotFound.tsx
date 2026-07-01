'use client'

import { Button, Card, CardFooter, CardHeader, Image } from '@heroui/react'
import { ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'

export const NotFoundComponent = () => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center p-8 size-full">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex items-center pt-8">
          <div className="w-full flex flex-col justify-center items-center gap-y-4">
            <Image
              src="/not-found.gif"
              alt="页面未找到动图"
              className="size-40"
            />
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary">404 Not Found</h1>
              <p className="text-default-500">请检查路由是否正确</p>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-wrap justify-between gap-2 px-8 pb-8">
          <Button
            startContent={<ArrowLeft className="size-4" />}
            variant="flat"
            color="primary"
            onPress={() => router.back()}
          >
            返回上一页
          </Button>
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
