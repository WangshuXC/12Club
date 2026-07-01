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
import localforage from 'localforage'

import { Loading } from '@/components/common/Loading'
import { useCreateResourceStore } from '@/store/editStore'

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

interface Props {
  onBannerFetched?: (url: string) => void
}

export function GetBangumiData({ onBannerFetched }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isAnime, setIsAnime] = useState(true)
  const { data, setData } = useCreateResourceStore()

  const [bangumiData, setBangumiData] = useState<BangumiSearchItem[]>([])

  const fetchBangumiData = async (name: string, type: number = 2) => {
    const res = await fetch(
      `https://api.bgm.tv/search/subject/${name}?responseGroup=large&type=${type}`
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

    setIsAnime(type === 2)
    setBangumiData(data?.list || [])
  }

  const fetchBannerImage = async (picUrl: string) => {
    try {
      const res = await fetch('/api/edit/proxy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: picUrl })
      })

      if (
        !res.ok ||
        res.headers.get('content-type')?.includes('application/json')
      ) {
        addToast({
          title: '提示',
          description: '服务端拉取图片失败，已在新窗口中打开，请手动保存后上传',
          color: 'warning'
        })
        window.open(picUrl, '_blank')
        return
      }

      const blob = await res.blob()
      await localforage.setItem('resource-banner', blob)
      const url = URL.createObjectURL(blob)
      onBannerFetched?.(url)

      addToast({
        title: '成功',
        description: '封面图片已自动获取',
        color: 'success'
      })
    } catch {
      addToast({
        title: '提示',
        description: '服务端拉取图片失败，已在新窗口中打开，请手动保存后上传',
        color: 'warning'
      })
      window.open(picUrl, '_blank')
    }
  }

  const fetchDetailData = async (id: string, onClose: () => void) => {
    const res = await fetch(
      `https://api.bgm.tv/v0/subjects/${id}?responseGroup=large`
    )
    if (!res.ok) {
      addToast({
        title: '错误',
        description: '获取数据失败',
        color: 'danger'
      })
      return
    }

    const bangumiDetail = await res.json()
    const infoBox = bangumiDetail?.infobox

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

    const picUrl =
      bangumiDetail.images?.['large'] || bangumiDetail.images?.['medium']
    if (picUrl) {
      fetchBannerImage(picUrl)
    }

    // 根据 meta_tags 推断资源地区
    const metaTags: string[] = bangumiDetail.meta_tags || []
    const detectLanguage = (tags: string[]): string => {
      const tagSet = tags.map((t) => t.toLowerCase())
      if (tagSet.some((t) => ['日本', '日本动画'].includes(t))) return 'jp'
      if (
        tagSet.some((t) => ['中国', '中国大陆', '中国动画', '国产'].includes(t))
      )
        return 'zh'
      if (tagSet.some((t) => ['欧美', '美国', '英国'].includes(t))) return 'en'
      return 'other'
    }

    const getString = (v: string | string[] | undefined): string =>
      Array.isArray(v) ? (v[0] ?? '') : (v ?? '')

    setData({
      name: bangumiDetail.name_cn || bangumiDetail.name || '',
      dbId: `${isAnime ? 'a' : 'n'}${id.toString().padStart(6, '0')}`,
      translator: '',
      author: infoObject?.['Copyright']
        ? `${getString(infoObject?.['导演'])} | ${getString(infoObject?.['Copyright'])}`
        : getString(infoObject?.['导演']),
      introduction: bangumiDetail.summary || '',
      alias: [bangumiDetail.name, ...(infoObject?.['别名'] || [])].filter(
        Boolean
      ),
      tag: [],
      language: detectLanguage(metaTags),
      accordionTotal: Number(getString(infoObject?.['话数'])) || 0,
      released: bangumiDetail.date || ''
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
          }}
        >
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
          }}
        >
          获取bangumi数据-书籍
        </Button>
      </div>

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
                <ScrollShadow className="flex flex-col gap-4 px-6 py-4">
                  {bangumiData ? (
                    bangumiData?.map((item: BangumiSearchItem) => (
                      <div
                        key={item.id}
                        onClick={() =>
                          fetchDetailData(String(item.id), onClose)
                        }
                      >
                        <Card className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <CardBody>
                            <div className="flex gap-2">
                              <ImageComponent
                                src={item.images['large']}
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
