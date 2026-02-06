'use client'

import { useState, useEffect, useRef } from 'react'

import { Button, Chip, Input, addToast, Spinner } from '@heroui/react'
import { Plus, Tag } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { useOutsideClick } from '@/hooks/useOutsideClick'
import { FetchGet } from '@/utils/fetch'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  errors?: string
}

interface TagSuggestion {
  id: number
  name: string
  count: number
}

export const AdminTagInput = ({ tags, onChange, errors }: Props) => {
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
        const response = await FetchGet<{ data: TagSuggestion[] }>('/tag', {
          search: debouncedSearch.trim()
        })

        if (response.data) {
          // 过滤掉已经添加的标签
          const filteredSuggestions = response.data.filter(
            (suggestion) => !tags.includes(suggestion.name)
          )
          setSuggestions(filteredSuggestions)
          setShowSuggestions(filteredSuggestions.length > 0)
        }
      } catch (error) {
        addToast({
          title: '错误',
          description: error?.toString(),
          color: 'danger'
        })
      } finally {
        setIsSearching(false)
      }
    }

    searchTags()
  }, [debouncedSearch, tags])

  const addTag = (tagName?: string) => {
    const tag = (tagName || newTag).trim()
    if (tags.includes(tag)) {
      addToast({
        title: '错误',
        description: '请不要使用重复的标签',
        color: 'danger'
      })
      return
    }

    if (tag) {
      onChange([...tags, tag])
      setNewTag('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion: TagSuggestion) => {
    addTag(suggestion.name)
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  // 高亮关键词
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'))

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={index} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">资源标签 (可选)</label>
      <div className="relative" ref={suggestionsRef}>
        <div className="flex gap-2">
          <Input
            placeholder="输入关键词搜索或创建标签"
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
            endContent={isSearching && <Spinner size="sm" color="primary" />}
          />
          <Button
            color="primary"
            onPress={() => addTag()}
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
        为资源添加标签，便于分类和检索。输入关键词可搜索已有标签，或直接创建新标签。
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag, index) => (
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
