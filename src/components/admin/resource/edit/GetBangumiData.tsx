'use client'

import { useState } from 'react'

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
} from '@heroui/react'

import { Loading } from '@/components/common/Loading'

interface BangumiSearchItem {
  id: number
  name: string
  name_cn: string
  summary: string
  images: Record<string, string>
}

interface BangumiInfoboxItem {
  key: string
  value: string | Array<{ v: string } | string>
}

interface ResourceFormData {
  name?: string
  author?: string
  introduction?: string
  accordionTotal?: string | number | string[]
  released?: string
  [key: string]: unknown
}

interface Props {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: (data: any) => void
  setAliases: (aliases: string[]) => void
}

export function GetBangumiData({ name, setData, setAliases }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const [bangumiData, setBangumiData] = useState<BangumiSearchItem[]>([])

  const fetchBangumiData = async (name: string) => {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${name}?responseGroup=large&type=2`
    )
    if (!res.ok) {
      addToast({
        title: '错误',
        description: '获取数据失败',
        color: 'danger'
      })
      return
    }

    const data = await res.json()

    if (data.code === 404) {
      addToast({
        title: '警告',
        description: '没有获取到数据，请改名后重新获取',
        color: 'warning'
      })
      return
    }

    setBangumiData(data?.list || [])
  }

  const fetchDetailData = async (id: string, onClose: () => void) => {
    const res = await fetch(
      `https://api.bgm.tv/v0/subjects/${id}?responseGroup=large&type=2`
    )
    if (!res.ok) {
      addToast({
        title: '错误',
        description: '获取数据失败',
        color: 'danger'
      })
      return
    }

    const data = await res.json()
    const infoBox = data?.infobox

    // 将 infoBox 转化为对象
    const infoObject: Record<string, string | string[]> = {}
    ;(infoBox as BangumiInfoboxItem[]).forEach((item) => {
      if (Array.isArray(item.value)) {
        infoObject[item.key] = item.value.map((val) =>
          typeof val === 'object' && 'v' in val ? val.v : String(val)
        )
      } else {
        infoObject[item.key] = item.value
      }
    })
    const getString = (v: string | string[] | undefined): string =>
      Array.isArray(v) ? (v[0] ?? '') : (v ?? '')

    setAliases([data.name, ...(infoObject?.['别名'] || [])])
    setData((prev: ResourceFormData) => ({
      ...prev,
      name: String(data.name_cn ?? ''),
      author: infoObject['Copyright']
        ? `${getString(infoObject['导演'])} | ${getString(infoObject['Copyright'])}`
        : getString(infoObject['导演']),
      introduction: String(data.summary ?? ''),
      accordionTotal: getString(infoObject['话数']),
      released: String(data.date ?? '')
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
        }}
      >
        获取bangumi数据
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="3xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                选择数据
              </ModalHeader>
              <ModalBody>
                <ScrollShadow className="flex flex-col gap-4">
                  {bangumiData ? (
                    bangumiData?.map((item: BangumiSearchItem) => (
                      <div
                        key={item.id}
                        onClick={() => fetchDetailData(String(item.id), onClose)}
                      >
                        <Card className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <CardBody>
                            <div className="flex gap-2">
                              <ImageComponent
                                src={
                                  item.images?.['large'] ||
                                  item.images?.['medium']
                                }
                                alt={item.name}
                                className="rounded-lg min-w-24 max-w-24"
                              />
                              <div className="flex flex-col gap-2">
                                <h3>
                                  {item.name_cn} | {item.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
                                  {item.summary}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <Loading hint="获取数据中..." />
                  )}
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
  )
}
