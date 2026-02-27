'use client'

import { useState } from 'react'

import { Button, Chip, Input, addToast } from '@heroui/react'
import { Plus } from 'lucide-react'

interface Props {
  aliases: string[]
  onChange: (aliases: string[]) => void
  errors?: string
}

export const AdminAliasInput = ({ aliases, onChange, errors }: Props) => {
  const [newAlias, setNewAlias] = useState<string>('')

  const addAlias = () => {
    const alias = newAlias.trim()
    if (aliases.includes(alias)) {
      addToast({
        title: '错误',
        description: '请不要使用重复的别名',
        color: 'danger'
      })
      return
    }

    if (alias) {
      onChange([...aliases, alias])
      setNewAlias('')
    }
  }

  const removeAlias = (index: number) => {
    onChange(aliases.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">资源别名 (可选)</label>
      <div className="flex gap-2">
        <Input
          placeholder="输入后点击加号添加"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          className="flex-1"
          isInvalid={!!errors}
          errorMessage={errors}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addAlias()
            }
          }}
        />
        <Button
          color="primary"
          onPress={addAlias}
          isIconOnly
          aria-label="添加资源别名"
        >
          <Plus size={20} />
        </Button>
      </div>
      <p className="text-sm text-default-500">
        建议填写资源的日语原名以便搜索, 我们强烈建议您将日文原名写为{' '}
        <b>第一个</b> 别名。
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {aliases.map((alias, index) => (
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
