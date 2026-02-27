'use client'

import { useState } from 'react'

import { addToast, Button, Chip, Input } from '@heroui/react'
import { Plus } from 'lucide-react'

import { useCreateResourceStore } from '@/store/editStore'

interface Props {
  errors: string | undefined
}

export const AliasInput = ({ errors }: Props) => {
  const { data, setData } = useCreateResourceStore()
  const [newAlias, setNewAlias] = useState<string>('')

  const addAlias = () => {
    const alias = newAlias.trim()
    if (data.alias.includes(alias)) {
      addToast({
        title: '错误',
        description: '请不要使用重复的别名',
        color: 'danger'
      })
      return
    }

    if (newAlias.trim()) {
      setData({ ...data, alias: [...data.alias, alias] })
      setNewAlias('')
    }
  }

  const removeAlias = (index: number) => {
    setData({
      ...data,
      alias: data.alias.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl">资源别名 (可选)</h2>
      <div className="flex gap-2">
        <Input
          labelPlacement="outside"
          placeholder={
            data.alias.length > 0
              ? `已添加${data.alias.length}个别名`
              : '输入资源别名'
          }
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          className="flex-1"
          isInvalid={!!errors}
          errorMessage={errors}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addAlias()
          }}
        />
        <Button
          color="primary"
          onPress={addAlias}
          className="self-end"
          isIconOnly
          aria-label="添加 Galgame 别名"
        >
          <Plus size={20} />
        </Button>
      </div>
      <p className="text-sm text-default-500">
        建议填写资源的日语原名以便搜索, 我们强烈建议您将日文原名写为{' '}
        <b>第一个</b> 别名。
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {data?.alias?.map((alias, index) => (
          <Chip
            key={index}
            onClose={() => removeAlias(index)}
            variant="flat"
            className="h-8"
          >
            {alias}
          </Chip>
        ))}
      </div>
    </div>
  )
}
