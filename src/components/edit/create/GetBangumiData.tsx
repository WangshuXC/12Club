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
import { useCreateResourceStore } from '@/store/editStore'

export function GetBangumiData() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isAnime, setIsAnime] = useState(true)
  const { data, setData } = useCreateResourceStore()

  const [bangumiData, setBangumiData] = useState<any>([])

  const fetchBangumiData = async (name: string, type: number = 2) => {
    const res = await fetch(`https://api.bgm.tv/search/subject/${name}?responseGroup=large&type=${type}`)
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

    setIsAnime(type === 2)
    setBangumiData(data?.list || [])
  }

  const fetchDetailData = async (id: string, onClose: () => void) => {
    const res = await fetch(`https://api.bgm.tv/v0/subjects/${id}?responseGroup=large`)
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

    const picUrl = data.images?.["large"] || data.images?.["medium"]
    addToast({
      title: '提示',
      description: '图片已在新窗口中打开，可在新窗口中直接拖拽上传',
      color: 'success'
    })
    window.open(picUrl, '_blank')

    setData({
      ...data,
      dbId: `${isAnime ? 'a' : 'n'}${id.toString().padStart(6, '0')}`,
      name: data.name_cn,
      translator: '',
      author: infoObject?.['Copyright'] ? `${infoObject?.['导演']} | ${infoObject?.['Copyright']}` : infoObject?.['导演'],
      introduction: data.summary,
      alias: [data.name, ...infoObject?.['别名'] || []],
      tag: [],
      accordionTotal: infoObject?.['话数'] || 0,
      released: data.date,
    })
    onClose()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onPress={() => {
            onOpen()
            addToast({
              title: '提示',
              description: '获取数据需要科学上网',
              color: 'default'
            })
            fetchBangumiData(data.name, 2)
          }}>
                    获取bangumi数据-动漫
        </Button>
        <Button
          onPress={() => {
            onOpen()
            addToast({
              title: '提示',
              description: '获取数据需要科学上网',
              color: 'default'
            })
            fetchBangumiData(data.name, 1)
          }}>
                    获取bangumi数据-书籍
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior="inside" size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">选择数据</ModalHeader>
              <ModalBody>
                <ScrollShadow className="flex flex-col gap-4 px-6 py-4">
                  {bangumiData ? bangumiData?.map((item: any) => (
                    <div key={item.id} onClick={() => fetchDetailData(item.id, onClose)}>
                      <Card className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <CardBody>
                          <div className="flex gap-2">
                            <ImageComponent
                              src={item.images["large"]}
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
