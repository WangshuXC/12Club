'use client'

import { useState } from "react"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Card,
  CardBody,
  Image as ImageComponent,
  useDisclosure,
  addToast
} from "@heroui/react";

import { Loading } from "@/components/common/Loading";

interface Props {
    name: string
    setData: (data: any) => void
    setAliases: (aliases: string[]) => void
}

export function GetBangumiData({ name, setData, setAliases }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [bangumiData, setBangumiData] = useState<any>([])

  const fetchBangumiData = async (name: string) => {
    const res = await fetch(`https://api.bgm.tv/search/subject/${name}?responseGroup=large&type=2`)
    if (!res.ok) {
      addToast({
        title: '错误',
        description: '获取数据失败',
        color: 'danger'
      });
      return
    }

    const data = await res.json()

    if (data.code === 404) {
      addToast({
        title: '警告',
        description: '没有获取到数据，请改名后重新获取',
        color: 'warning'
      });
      return
    }

    setBangumiData(data?.list || [])
  }

  const fetchDetailData = async (id: string, onClose: () => void) => {
    const res = await fetch(`https://api.bgm.tv/v0/subjects/${id}?responseGroup=large&type=2`)
    if (!res.ok) {
      addToast({
        title: '错误',
        description: '获取数据失败',
        color: 'danger'
      });
      return
    }

    const data = await res.json()
    const infoBox = data?.infobox

    // 将 infoBox 转化为对象
    const infoObject: Record<string, any> = {};
    (infoBox as Array<{ key: string; value: any }>).forEach((item) => {
      if (Array.isArray(item.value)) {
        infoObject[item.key] = item.value.map((val: any) => val.v || val)
      } else {
        infoObject[item.key] = item.value
      }
    })
    setAliases([data.name, ...infoObject?.['别名'] || []])
    setData((prev: any) => ({
      ...prev,
      name: data.name_cn,
      author: infoObject['Copyright'] ? `${infoObject['导演']} | ${infoObject['Copyright']}` : infoObject['导演'],
      introduction: data.summary,
      accordionTotal: infoObject['话数'],
      released: data.date,
    }))
    onClose()
  }

  return (
    <>
      <Button
        onPress={() => {
          onOpen()
          addToast({
            title: '提示',
            description: '获取数据需要科学上网',
            color: 'default'
          })
          fetchBangumiData(name)
        }}>
                获取bangumi数据
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">选择数据</ModalHeader>
              <ModalBody>
                <ScrollShadow className="flex flex-col gap-4">
                  {bangumiData ? bangumiData?.map((item: any) => (
                    <div key={item.id} onClick={() => fetchDetailData(item.id, onClose)}>
                      <Card className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <CardBody>
                          <div className="flex gap-2">
                            <ImageComponent
                              src={item.images?.["large"] || item.images?.["medium"]}
                              alt={item.name}
                              className="rounded-lg min-w-24 max-w-24"
                            />
                            <div className="flex flex-col gap-2">
                              <h3>{item.name_cn} | {item.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">{item.summary}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  )) : <Loading hint="获取数据中..." />}
                </ScrollShadow>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                </Button>
                <Button color="primary" onPress={onClose}>
                                    Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
