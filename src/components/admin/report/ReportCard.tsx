'use client'

import { Avatar, Button, Card, CardBody, CardFooter, Chip } from '@heroui/react'
import Link from 'next/link'

import { formatDate } from '@/utils/time'

import { ReportHandler } from './ReportHandler'

import type { AdminReport } from '@/types/api/admin'

interface Props {
  report: AdminReport
}

export const ReportCard = ({ report }: Props) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar
              classNames={{
                base: 'w-10 h-10 min-w-10 min-h-10'
              }}
              name={report.sender!.name}
              src={report.sender!.avatar}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{report.sender?.name}</h2>
                <span className="text-small text-default-500">
                  {formatDate(report.created, {
                    isPrecise: true,
                    isShowYear: true
                  })}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{report.content}</p>
              {report?.replies?.length ? (
                <div className="bg-primary/20 p-2 rounded-xl mt-2 flex flex-col gap-2">
                  {report.replies?.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-4">
                      <Avatar
                        name={reply.sender!.name}
                        src={reply.sender!.avatar}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{reply.sender!.name}</p>
                          <span className="text-small text-default-500">
                            {formatDate(reply.created, {
                              isPrecise: true,
                              isShowYear: true
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <ReportHandler initialReport={report} />
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex items-center gap-4 mt-2">
          <Chip
            color={report.status ? 'success' : 'danger'}
            variant="flat"
          >
            {report.status ? '已处理' : '未处理'}
          </Chip>
          <Button
            as={Link}
            size="sm"
            color="primary"
            variant="flat"
            href={report.link}
          >
            前往资源
          </Button>
          <Button
            as={Link}
            size="sm"
            color="primary"
            variant="flat"
            href={`/user/${report.sender?.id}/resource`}
          >
            前往用户
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
