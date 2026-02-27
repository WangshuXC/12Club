'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

import {
  Input,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Card,
  CardBody,
  Image,
  Chip,
  Spinner,
  Pagination,
  Button
} from '@heroui/react'
import { Search, X } from 'lucide-react'

import { FetchPost } from '@/utils/fetch'

import type { AdminSeriesResource } from '@/types/api/admin'

interface Resource {
  title: string
  image: string
  dbId: string
  view: number
  download: number
  status: number
  favorite_by: number
  comments: number
}

interface ResourceSelectorProps {
  selectedResources: AdminSeriesResource[]
  onSelectionChange: (resources: AdminSeriesResource[]) => void
  excludeDbIds?: string[] // 排除已在系列中的资源
}

export const ResourceSelector = ({
  selectedResources,
  onSelectionChange,
  excludeDbIds = []
}: ResourceSelectorProps) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['anime'])
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // 使用 ref 来存储排除的资源dbId，避免每次渲染时重新创建
  const excludeDbIdsRef = useRef<string[]>(excludeDbIds)

  // 标记是否已进行过首次搜索
  const hasSearched = useRef(false)

  // 防抖定时器
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // 当 excludeDbIds 发生实际变化时更新 ref
  const excludeIdsKey = useMemo(() => excludeDbIds.join(','), [excludeDbIds])
  useEffect(() => {
    excludeDbIdsRef.current = excludeDbIds
  }, [excludeIdsKey, excludeDbIds])

  // 已选中的 dbId 集合
  const selectedDbIds = useMemo(
    () => selectedResources.map((r) => r.dbId),
    [selectedResources]
  )

  const limit = 12

  // 获取资源列表
  const fetchResources = useCallback(
    async (searchQuery: string) => {
      // 只有当搜索框有内容时才触发搜索
      if (!searchQuery.trim()) {
        return
      }

      setLoading(true)
      hasSearched.current = true

      try {
        const searchData = {
          query: [searchQuery.trim()],
          page,
          limit,
          searchOption: {
            searchInIntroduction: false,
            searchInAlias: true,
            searchInTag: false,
            selectedResourceType: selectedTypes,
            selectedType: 'all',
            sortField: 'updated',
            sortOrder: 'desc',
            selectedLanguage,
            selectedStatus
          }
        }

        const response = await FetchPost('/search', searchData)

        if (typeof response === 'string') {
          console.error('搜索资源失败:', response)
          return
        }

        // 过滤掉已排除的资源，使用 ref 中的值
        const filteredResources = (response as any)._data.filter(
          (resource: any) => {
            return !excludeDbIdsRef.current.includes(resource.dbId)
          }
        )

        setResources(filteredResources)
        setTotal((response as any).total)
      } catch (error) {
        console.error('获取资源列表失败:', error)
      } finally {
        setLoading(false)
      }
    },
    [page, selectedTypes, selectedLanguage, selectedStatus]
  )

  // 当筛选条件变化时重新加载（仅在已搜索过且有搜索关键词时）
  useEffect(() => {
    if (hasSearched.current && query.trim()) {
      fetchResources(query)
    }
  }, [page, selectedTypes, selectedLanguage, selectedStatus])

  // 输入框值变化时自动搜索（带防抖）
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // 如果搜索框为空，清空结果
    if (!query.trim()) {
      setResources([])
      setTotal(0)
      return
    }

    // 设置防抖，300ms 后执行搜索
    debounceTimer.current = setTimeout(() => {
      setPage(1)
      fetchResources(query)
    }, 300)

    // 清理函数
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query])

  // 资源选择处理 - 现在返回完整的资源对象
  const handleResourceToggle = useCallback(
    (resource: Resource, checked: boolean) => {
      if (checked) {
        // 转换为 AdminSeriesResource 格式
        const newResource: AdminSeriesResource = {
          id: 0, // 临时 ID，实际保存时会被忽略
          dbId: resource.dbId,
          name: resource.title,
          banner: resource.image,
          type: [],
          status: resource.status,
          created: new Date().toISOString()
        }
        onSelectionChange([...selectedResources, newResource])
      } else {
        onSelectionChange(
          selectedResources.filter((r) => r.dbId !== resource.dbId)
        )
      }
    },
    [selectedResources, onSelectionChange]
  )

  // 获取资源状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return '连载中'
      case 1:
        return '已完结'
      case 2:
        return '老站数据'
      default:
        return '未知'
    }
  }

  // 获取资源状态颜色
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'warning'
      case 1:
        return 'success'
      case 2:
        return 'danger'
      default:
        return 'default'
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="搜索资源名称..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startContent={<Search size={16} />}
            className="flex-1"
            isClearable
            onClear={() => setQuery('')}
          />
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <CheckboxGroup
            orientation="horizontal"
            value={selectedTypes}
            onValueChange={setSelectedTypes}
          >
            <Checkbox value="anime">动漫</Checkbox>
            <Checkbox value="comic">漫画</Checkbox>
            <Checkbox value="game">游戏</Checkbox>
            <Checkbox value="novel">小说</Checkbox>
          </CheckboxGroup>

          <div className="flex gap-2">
            <Select
              label="语言"
              labelPlacement="outside-left"
              selectedKeys={[selectedLanguage]}
              onSelectionChange={(keys) => {
                const language = Array.from(keys)[0] as string
                if (language) setSelectedLanguage(language)
              }}
              className="w-32"
            >
              <SelectItem key="all">全部</SelectItem>
              <SelectItem key="zh">中文</SelectItem>
              <SelectItem key="ja">日文</SelectItem>
              <SelectItem key="en">英文</SelectItem>
              <SelectItem key="other">其他</SelectItem>
            </Select>

            <Select
              label="状态"
              labelPlacement="outside-left"
              selectedKeys={[selectedStatus]}
              onSelectionChange={(keys) => {
                const status = Array.from(keys)[0] as string
                if (status) setSelectedStatus(status)
              }}
              className="w-40"
            >
              <SelectItem key="all">全部</SelectItem>
              <SelectItem key="0">连载中</SelectItem>
              <SelectItem key="1">已完结</SelectItem>
              <SelectItem key="2">老站数据</SelectItem>
            </Select>
          </div>
        </div>
      </div>

      {/* 已选择的资源数量 */}
      {selectedResources.length > 0 && (
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            已选择 {selectedResources.length} 个资源
          </Chip>
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<X size={14} />}
            onPress={() => onSelectionChange([])}
          >
            清空选择
          </Button>
        </div>
      )}

      {/* 资源列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => {
            const isSelected = selectedDbIds.includes(resource.dbId)

            return (
              <Card
                key={resource.dbId}
                isPressable
                className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
                onPress={() => handleResourceToggle(resource, !isSelected)}
              >
                <CardBody className="p-3">
                  <div className="flex gap-3 overflow-hidden">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      className="w-16 h-24 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium text-sm truncate"
                        title={resource.title}
                      >
                        {resource.title}
                      </h4>
                      <p className="text-xs text-default-500 mt-1">
                        {resource.dbId}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(resource.status) as any}
                          variant="flat"
                        >
                          {getStatusText(resource.status)}
                        </Chip>
                      </div>
                      <div className="flex gap-2 text-xs text-default-500 mt-1">
                        <span>浏览: {resource.view}</span>
                        <span>下载: {resource.download}</span>
                      </div>
                    </div>
                    <Checkbox
                      isSelected={isSelected}
                      onValueChange={(checked) =>
                        handleResourceToggle(resource, checked)
                      }
                    />
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            showControls
            showShadow
          />
        </div>
      )}

      {/* 空状态 */}
      {!loading && resources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-default-500">
            {hasSearched.current
              ? '未找到符合条件的资源'
              : '请输入关键词搜索资源'}
          </p>
        </div>
      )}
    </div>
  )
}
