'use client'

import { Card, CardBody, CardHeader } from '@heroui/react'

import { Resources } from './Resources'

interface Props {
  id: string
}

export const ResourceTab = ({ id }: Props) => {
  return (
    <Card className="p-1 lg:p-8">
      <CardHeader className="p-4">
        <h2 className="text-2xl font-medium">资源链接</h2>
      </CardHeader>
      <CardBody className="p-4">
        <div className="text-default-600">
          <p>
            请注意, 本站的下载资源均来自互联网或用户上传,
            仅供参考与学习，请在下载后于24小时内删除。
          </p>
        </div>

        <Resources id={id} />
      </CardBody>
    </Card>
  )
}
