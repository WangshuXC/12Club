'use client'

import { useState, useEffect, useRef } from 'react'

import { addToast, Button, Chip, Input, Spinner } from '@heroui/react'
import { Plus, Tag } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useCreateResourceStore } from '@/store/editStore'
import { FetchGet } from '@/utils/fetch'

interface Props {
    errors: string | undefined
}

interface TagSuggestion {
    id: number
    name: string
    count: number
}

export const TagInput = ({ errors }: Props) => {
  const { data, setData } = useCreateResourceStore()
  const [newTag, setNewTag] = useState<string>('')
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debouncedSearch] = useDebounce(newTag, 300)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useOutsideClick(suggestionsRef, () => setShowSuggestions(false))

  // 搜索标签
  useEffect(() => {
    const searchTags = async () => {
      if (debouncedSearch.trim().length === 0) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsSearching(true)

      try {
        const response = await FetchGet<{ data: TagSuggestion[] }>(
          '/tag',
          { search: debouncedSearch.trim() }
        )

        if (response.data) {
          // 过滤掉已经添加的标签
          const filteredSuggestions = response.data.filter(
            (suggestion) => !data.tag.includes(suggestion.name)
          )
          setSuggestions(filteredSuggestions)
          setShowSuggestions(filteredSuggestions.length > 0)
        }
      } catch (error) {
        console.error('搜索标签失败:', error)
      } finally {
        setIsSearching(false)
      }
    }

    searchTags()
  }, [debouncedSearch, data.tag])

  const addTag = (tagName?: string) => {
    const tag = (tagName || newTag).trim()
    if (data.tag.includes(tag)) {
      addToast({
        title: '错误',
        description: '请不要使用重复的标签',
        color: 'danger'
      })
      return
    }

    if (tag) {
      setData({ ...data, tag: [...data.tag, tag] })
      setNewTag('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: TagSuggestion) => {
    addTag(suggestion.name)
  }

  const removeTag = (index: number) => {
    setData({
      ...data,
      tag: data.tag.filter((_, i) => i !== index)
    })
  }

  // 高亮关键词
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'))

    return (
      <>
        {parts.map((part, index) => (
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={index} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        ))}
      </>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl">资源标签 (可选)</h2>
      <div className="relative" ref={suggestionsRef}>
        <div className="flex gap-2">
          <Input
            labelPlacement="outside"
            placeholder={data.tag.length > 0 ? `已添加${data.tag.length}个标签` : '输入关键词搜索或创建标签'}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1"
            isInvalid={!!errors}
            errorMessage={errors}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
            endContent={
              isSearching && (
                <Spinner size="sm" color="primary" />
              )
            }
          />
          <Button
            color="primary"
            onPress={() => addTag()}
            className="self-end"
            isIconOnly
            aria-label="添加资源标签"
          >
            <Plus size={20} />
          </Button>
        </div>

        {/* 搜索建议列表 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-content1 border border-default-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 hover:bg-default-100 cursor-pointer transition-colors flex items-center justify-start gap-2"
                onClick={() => selectSuggestion(suggestion)}
              >
                <Tag size={16} />
                <span className="text-sm font-medium">
                  {highlightKeyword(suggestion.name, debouncedSearch)}
                </span>
                <span className="text-xs bg-default-300 rounded-full px-4 py-1">
                  {suggestion.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-default-500">
                为资源添加标签，便于分类和检索。输入关键词可搜索已有标签，或直接创建新标签。例如: 校园、恋爱、百合、治愈等。
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {data?.tag?.map((tag, index) => (
          <Chip
            key={index}
            onClose={() => removeTag(index)}
            variant="flat"
            color="primary"
            className="h-8"
          >
            {tag}
          </Chip>
        ))}
      </div>
    </div>
  )
}

