'use client'

import { useEffect, useState } from "react"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  addToast,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from "@heroui/react";
import { Edit2, ExternalLink } from 'lucide-react'

import { FetchGet } from "@/utils/fetch";
import { getResourceTypeByDbId } from "@/utils/router"

import type { AdminResource } from "@/types/api/admin"

export function AutoPlayUrl({ resource, setNeedUpdate }: { resource: AdminResource, setNeedUpdate: (needUpdate: boolean) => void }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [linkList, setLinkList] = useState<string[]>([]);
  const isAnime = getResourceTypeByDbId(resource.dbId) === 'anime'

  const removeHttpPrefix = (url: string) => {
    return url.replace(/^https?:/, '')
  }

  const fetchDetailData = async () => {
    const response = await FetchGet<{
            data: string[]
        }>('/admin/resource/autoCreate', {
          dbId: resource.dbId
        })

    const fileList = response.data

    setLinkList(fileList)
  };

  useEffect(() => {
    fetchDetailData()
  }, [])

  const createPlayLink = async (onClose: () => void = () => { }) => {
    try {
      const response = await fetch('/api/admin/resource/autoCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: resource.id,
          linkList: linkList,
          onlyUpdatePatch: !isAnime
        })
      })

      const result = await response.json()

      if (result.success) {
        addToast({
          title: '成功',
          description: result.message,
          color: 'success'
        })
        setNeedUpdate(true)
      } else {
        addToast({
          title: '错误',
          description: result.message,
          color: 'danger'
        })
      }
    } catch (error) {
      addToast({
        title: '错误',
        description: '创建播放链接失败',
        color: 'danger'
      })
    }

    onClose?.()
  }

  return (
    <>
      <Button
        color={"success"}
        onPress={async () => {
          if (isAnime) {
            await fetchDetailData()
            onOpen()
          } else {
            createPlayLink()
          }
        }}>
        {isAnime ? '自动填写播放链接与官方资源' : '自动填写官方资源'}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">二次确认</ModalHeader>
              <ModalBody>
                                请确保数据openlist对应的文件夹下添加了资源，并且资源名称升序排列和集数对应
                <Table aria-label="播放链接列表">
                  <TableHeader>
                    <TableColumn width={100}>集数序号</TableColumn>
                    <TableColumn>播放链接</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {linkList?.map((link, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip color="primary" variant="flat">
                            {index + 1}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-xs" title={link}>
                              {removeHttpPrefix(link)}
                            </span>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => window.open(link, '_blank')}
                            >
                              <ExternalLink size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                                    取消
                </Button>
                <Button color="primary" onPress={() => createPlayLink(onClose)}>
                                    确认
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}