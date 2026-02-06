'use client'

import { Button, Input, Tooltip } from '@heroui/react'
import { Info } from 'lucide-react'

import { ExternalLink } from '@/components/common/ExternalLink'
import { useCreateResourceStore } from '@/store/editStore'

interface Props {
  errors: string | undefined
}

export const IdInput = ({ errors }: Props) => {
  const { data, setData } = useCreateResourceStore()

  return (
    <div className="w-full space-y-2">
      <h2 className="text-xl">DB ID (必选)      <Tooltip
        content={
          <>
            <p className="text-sm whitespace-pre-wrap p-2">
              动漫和小说的DB ID优先采用<ExternalLink link="https://bangumi.tv/anime" target="_blank">bangumi</ExternalLink>的项目id
              <br />
              例如《恋人不行》的链接为https://bangumi.tv/subject/524707，则DB ID为a524707（若id不足6位请在前面补0）
              <br /><br />
              游戏的DB ID优先采用vndb的项目id
              <br />简介、发行等相关数据和资源也可于<ExternalLink link="https://touchgal.us" target="_blank">touchgal</ExternalLink>上查找
              <br />
            </p>
          </>
        }>
        <Button
          isIconOnly
          size="sm"
          color="primary"
          variant='light'
          aria-label="查看提示"
        >
          <Info size={16} />
        </Button>
      </Tooltip></h2>

      <Input
        variant="underlined"
        labelPlacement="outside"
        color="primary"
        placeholder="DB ID是用于标识资源唯一性以及判断资源类型，格式为【一位字母+六位数字】"
        value={data.dbId}
        onChange={(e) => setData({ ...data, dbId: e.target.value })}
        isInvalid={!!errors}
        errorMessage={errors}
      />

      <p className="text-sm text-default-500">
        a表示动漫，c表示漫画，g表示游戏，n表示小说
      </p>
    </div>
  )
}
